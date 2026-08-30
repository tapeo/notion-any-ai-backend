# Google OAuth (web + mobile)

## Web OAuth (redirect flow)

### Config

```ts
// lib/server/config.ts (add to Config)
static readonly google_auth = {
  client_id: process.env.GOOGLE_CLIENT_ID!,
  client_secret: process.env.GOOGLE_CLIENT_SECRET!,
  redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
  authenticated_redirect_uri: process.env.GOOGLE_AUTHENTICATED_REDIRECT_URI!,
  generic_error_redirect_uri: process.env.GOOGLE_GENERIC_ERROR_REDIRECT_URI!,
};
```

### Controller

`GoogleAuthController.handleAuthRequest` generates a random state, stores it in an `OAuthState` collection with a 10-minute expiry, and redirects to Google. `handleCallbackRequest` verifies the state, exchanges the code for tokens, fetches the user profile, and calls `authenticateGoogleProfile` which creates the user if missing or logs them in, then sets cookies and redirects to `authenticated_redirect_uri`.

```ts
// controllers/google-auth.controller.ts (summary)
export class GoogleAuthController {
  static handleAuthRequest = async (): Promise<NextResponse> => {
    const state = crypto.randomBytes(16).toString('hex');
    await OAuthStateSchema.create({ state, expires_at: new Date(Date.now() + 10 * 60 * 1000) });
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.append('client_id', Config.google_auth.client_id);
    authUrl.searchParams.append('redirect_uri', Config.google_auth.redirect_uri);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', 'email profile');
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('access_type', 'offline');
    authUrl.searchParams.append('prompt', 'consent');
    return NextResponse.redirect(authUrl.toString());
  };

  static handleCallbackRequest = async (req: Request): Promise<NextResponse> => {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    // verify state, exchange code, fetch profile, authenticateGoogleProfile, setCookies, redirect
  };

  static authenticateGoogleProfile = async (profile: GoogleProfilePayload): Promise<AuthResult<LoginResultData>> => {
    const email = profile.email.trim().toLowerCase();
    let user = await UserController.getUserByEmail(email);
    if (!user) {
      if (!Config.app.allow_signup) return { status: 'error', statusCode: 403, message: 'Sign up is currently disabled' };
      const randomPassword = crypto.randomBytes(16).toString('hex');
      const hash = await bcrypt.hash(randomPassword, 10);
      user = await UserController.post(email, hash);
    }
    // patch name/picture if missing, generate tokens, store refresh, return
  };
}
```

### Routes

```ts
// app/api/auth/google/login/route.ts
export const GET = withDB(async () => GoogleAuthController.handleAuthRequest());

// app/api/auth/google/signup/route.ts
export const GET = withDB(async () => GoogleAuthController.handleAuthRequest());

// app/api/auth/google/callback/route.ts
export const GET = withDB(async (req: Request) => GoogleAuthController.handleCallbackRequest(req));
```

All three are in `PUBLIC_API_PREFIXES`. The client triggers login with `window.location.href = '/api/auth/google/login'`.

### OAuthState schema

```ts
const oauthStateSchema = new Schema<IOAuthState>({
  state: { type: String, required: true, unique: true, index: true },
  expires_at: { type: Date, required: true, index: { expires: 0 } },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
```

The TTL index (`expires: 0`) auto-deletes expired states.

## Mobile OAuth (id_token)

Mobile clients send the Google `id_token` directly. The server verifies it with `google-auth-library`.

```ts
// controllers/google-mobile-auth.controller.ts
import { OAuth2Client } from 'google-auth-library';

export class GoogleMobileAuthController {
  static signInWithGoogleIdToken = async (idToken: string): Promise<AuthResult<LoginResultData>> => {
    const client = new OAuth2Client();
    const ticket = await client.verifyIdToken({
      idToken: idToken.trim(),
      audience: getAllowedClientIds(),
    });
    const payload = ticket.getPayload();
    if (!payload?.email || !payload.email_verified) {
      return { status: 'error', statusCode: 401, message: 'Invalid Google id_token' };
    }
    return GoogleAuthController.authenticateGoogleProfile({
      email: payload.email.trim().toLowerCase(),
      name: payload.name?.trim() || null,
      picture_url: payload.picture?.trim() || null,
    });
  };
}
```

`getAllowedClientIds()` returns the web client ID plus any mobile client IDs from `GOOGLE_MOBILE_CLIENT_IDS` (comma-separated env var).

## Rules

- Always verify the `state` parameter on callback. It prevents CSRF.
- Consume the state (delete after use). One-time.
- `allow_signup` gates both web and mobile flows.
- On success, the web flow redirects to `authenticated_redirect_uri` with cookies set. The mobile flow returns tokens in the body so the mobile client can store them.
- Mobile clients that manage tokens themselves send `Authorization: Bearer <access_token>` and a `refresh_token` cookie/body for refresh. The proxy `extractAccessToken` checks both header and cookie.