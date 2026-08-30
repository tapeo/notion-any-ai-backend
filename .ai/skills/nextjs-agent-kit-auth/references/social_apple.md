# Apple mobile auth

Apple Sign In on the web uses a redirect flow similar to Google. On mobile (iOS native), the app receives an `identity_token` and an `authorization_code`, and sends them to the server. This guide covers the mobile flow.

## Config

```ts
// lib/server/config.ts (add to Config)
static readonly apple_auth = {
  client_id: process.env.APPLE_CLIENT_ID!,
  team_id: process.env.APPLE_TEAM_ID!,
  key_id: process.env.APPLE_KEY_ID!,
  private_key_base64: process.env.APPLE_PRIVATE_KEY_BASE64!,
};
```

The private key is the `.p8` file contents, base64-encoded. `APPLE_MOBILE_CLIENT_IDS` (comma-separated) lists additional iOS bundle IDs allowed to sign in.

## AppleTokenService

Verifies the Apple `identity_token` using Apple's JWKS, and optionally exchanges the `authorization_code` for a fresh `id_token` (useful when the native SDK only returns the code).

```ts
// services/apple-token.service.ts
import { createRemoteJWKSet, importPKCS8, errors as JoseErrors, jwtVerify, SignJWT } from 'jose';

export class AppleTokenService {
  private static appleJwks = createRemoteJWKSet(new URL('https://appleid.apple.com/auth/keys'));

  static async verifyIdentityToken(identityToken: string, userIdentifier: string, requestName?: string): Promise<AuthResult<AppleIdentityProfile>> {
    const allowedClientIds = getAllowedClientIds();
    const { payload } = await jwtVerify(identityToken, this.appleJwks, {
      issuer: 'https://appleid.apple.com',
      audience: allowedClientIds,
    });
    const appleUserId = payload.sub;
    if (!appleUserId || (userIdentifier && userIdentifier.trim() !== appleUserId)) {
      return { status: 'error', statusCode: 401, message: 'Apple user identifier mismatch' };
    }
    const email = (payload.email as string | undefined)?.toLowerCase() || null;
    const isEmailVerified = payload.email_verified === true || payload.email_verified === 'true';
    if (email && !isEmailVerified) {
      return { status: 'error', statusCode: 401, message: 'Apple account email is not verified' };
    }
    return {
      status: 'success',
      statusCode: 200,
      message: 'Apple identity_token verified',
      data: { apple_user_id: appleUserId, email, name: requestName?.trim() || null },
    };
  }
}
```

## AppleMobileAuthController

Links the Apple `user_id` to the app user. On first sign-in, the email from the identity token is used. On subsequent sign-ins, the app looks up the user by `apple_user_id` (Apple does not always return the email after the first auth).

```ts
// controllers/apple-mobile-auth.controller.ts
export class AppleMobileAuthController {
  static signInWithAppleCredential = async ({ identityToken, authorizationCode, userIdentifier, requestName }) => {
    const identityResult = await AppleTokenService.resolveIdentityToken(identityToken, authorizationCode);
    if (identityResult.status === 'error') return identityResult;

    const profileResult = await AppleTokenService.verifyIdentityToken(identityResult.data!, userIdentifier, requestName);
    if (profileResult.status === 'error') return profileResult;

    const linkedUser = await UserController.getUserByAppleUserId(profileResult.data.apple_user_id);
    const email = linkedUser?.email?.trim().toLowerCase() || profileResult.data.email;
    if (!email) return { status: 'error', statusCode: 400, message: 'Apple email is required on first sign-in' };

    const authResult = await GoogleAuthController.authenticateGoogleProfile(
      { email, name: profileResult.data.name, picture_url: null },
      'Apple',
    );
    if (authResult.status === 'error') return authResult;

    await this.linkAppleUserId(authResult.data.user._id, profileResult.data.apple_user_id);
    authResult.data.user.apple_user_id = profileResult.data.apple_user_id;
    return authResult;
  };

  private static async linkAppleUserId(userId: string | undefined, appleUserId: string) {
    const user = await UserController.getById(userId!);
    if (user?.apple_user_id && user.apple_user_id !== appleUserId) {
      return { status: 'error', statusCode: 409, message: 'Apple account is linked to a different user' };
    }
    if (!user?.apple_user_id) {
      await UserController.patch(userId!, { apple_user_id: appleUserId });
    }
    return { status: 'success', statusCode: 200, message: 'Apple account linked' };
  }
}
```

## Route

```ts
// app/api/auth/apple/mobile/route.ts
export const POST = withDB(async (req: Request) => AppleMobileAuthController.handleMobileRequest(req));
```

Add `/api/auth/apple` to `PUBLIC_API_PREFIXES`.

## Why reuse `authenticateGoogleProfile`

The Google controller's `authenticateGoogleProfile` is really a generic "authenticate by email, create if missing, issue tokens" function. Apple reuses it with `providerName = 'Apple'` for the Telegram notification text. If the name feels wrong, rename it to `authenticateOrCreateUser` in your app. The kit keeps the name to match the source.

## Rules

- Always verify the `identity_token` against Apple's JWKS. Never trust the client payload without verification.
- Check `email_verified`. Apple only includes email on the first sign-in for a given app+device.
- Link `apple_user_id` to the user after auth. On subsequent sign-ins, look up by `apple_user_id` first, fall back to email.
- Handle the duplicate key error (11000) on `apple_user_id` link: another user may already have that Apple ID. Return 409.
- `APPLE_MOBILE_CLIENT_IDS` lets multiple iOS bundle IDs share one server. Split by comma, trim, filter empty.