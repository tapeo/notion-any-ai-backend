# Auth controllers

## UserController

```ts
// controllers/user.controller.ts
import { UserSchema } from '@/schemas/user.schema';
import { type HydratedDocument, type User } from '@/model/user';

export class UserController {
  static getUserByEmail = async (email: string): Promise<HydratedDocument<User> | null> => {
    return UserSchema.findOne({ email: email.trim().toLowerCase() });
  };

  static getById = async (id: string, ignore: string[] = []): Promise<HydratedDocument<User> | null> => {
    return UserSchema.findById(id).select(ignore.map((f) => `-${f}`).join(' '));
  };

  static post = async (email: string, passwordHash: string, isAnonymous = false, extra: Record<string, unknown> = {}): Promise<HydratedDocument<User> | null> => {
    return UserSchema.create({ email, password: passwordHash, is_anonymous: isAnonymous, ...extra });
  };

  static patch = async (id: string, data: Partial<User> & Record<string, unknown>): Promise<HydratedDocument<User> | null> => {
    return UserSchema.findByIdAndUpdate(id, data, { new: true });
  };

  static updateLastAccess = async (userId: string): Promise<void> => {
    try {
      await UserSchema.findByIdAndUpdate(userId, { last_access: new Date().toISOString() });
    } catch (error) {
      console.error('Failed to update last_access:', error);
    }
  };
}
```

## LoginController

```ts
// controllers/login.controller.ts
import bcrypt from 'bcrypt';
import { NextResponse, type NextRequest } from 'next/server';
import { UserController } from './user.controller';
import { RefreshTokenController } from './refresh-token.controller';
import { setCookies, clearCookies } from '@/lib/server/cookie';
import { encrypt } from '@/lib/server/crypto';
import { generateAccessToken, generateRefreshToken } from '@/lib/server/jwt';
import { JwtAuth } from '@/proxy/jwt-auth';
import type { AuthResult, LoginResultData } from '@/model/auth';

export class LoginController {
  static handleLoginRequest = async (req: Request): Promise<NextResponse> => {
    try {
      const { email, password } = await req.json();
      const result = await this.login(email, password);
      if (result.status === 'success' && result.data) {
        await setCookies(result.data.access_token, result.data.refresh_token);
      }
      return NextResponse.json(result, { status: result.statusCode });
    } catch (error) {
      console.error('Login error:', error);
      return NextResponse.json({ status: 'error', message: 'Internal server error' }, { status: 500 });
    }
  };

  static handleLogoutRequest = async (req: NextRequest): Promise<NextResponse> => {
    try {
      const jwt = JwtAuth.getFromHeaders(req);
      const userId = jwt?.user_id;
      if (!userId) {
        await clearCookies();
        return NextResponse.json({ status: 'error', message: 'Not authenticated' }, { status: 401 });
      }
      await this.logout(userId);
      await clearCookies();
      return NextResponse.json({ status: 'success', message: 'Logout successful' });
    } catch (error) {
      console.error('Logout error:', error);
      return NextResponse.json({ status: 'error', message: 'Internal server error' }, { status: 500 });
    }
  };

  static login = async (email: string, password: string): Promise<AuthResult<LoginResultData>> => {
    if (!email || !password) {
      return { status: 'error', statusCode: 400, message: 'Email and password are required' };
    }
    const sanitized = email.trim().toLowerCase();
    const user = await UserController.getUserByEmail(sanitized);
    if (!user) return { status: 'error', statusCode: 401, message: 'Invalid email or password' };
    const match = await bcrypt.compare(password, user.password);
    if (!match) return { status: 'error', statusCode: 401, message: 'Invalid email or password' };

    const accessToken = generateAccessToken(user._id.toString(), sanitized);
    const refreshToken = generateRefreshToken(user._id.toString(), sanitized);
    const encrypted = encrypt(refreshToken);
    const posted = await RefreshTokenController.post(user._id.toString(), encrypted);
    if (!posted) return { status: 'error', statusCode: 401, message: 'Could not store refresh token' };

    void UserController.updateLastAccess(user._id.toString());
    return {
      status: 'success',
      statusCode: 200,
      message: 'Login successful',
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: { ...user.toObject(), _id: user._id.toString() },
      },
    };
  };

  static logout = async (userId: string): Promise<AuthResult> => {
    await RefreshTokenController.deleteAllByUserId(userId);
    return { status: 'success', statusCode: 200, message: 'Logout successful' };
  };
}
```

## RefreshTokenController

```ts
// controllers/refresh-token.controller.ts
import { DateTime } from 'luxon';
import { Config } from '@/lib/server/config';
import { UserSchema } from '@/schemas/user.schema';
import type { RefreshToken } from '@/model/refresh-token';

export class RefreshTokenController {
  static post = async (userId: string, encryptedRefreshToken: string): Promise<RefreshToken | null> => {
    const data: RefreshToken = {
      expires_at: DateTime.now().plus({ seconds: Config.jwt.cookie_refresh_token_max_age }).toJSDate(),
      encrypted_jwt: encryptedRefreshToken,
    };
    const result = await UserSchema.findByIdAndUpdate(userId, { $push: { refresh_tokens: data } }, { new: true });
    return result ? data : null;
  };

  static getByUserId = async (userId: string): Promise<RefreshToken[]> => {
    const user = await UserSchema.findById(userId);
    return user?.refresh_tokens ?? [];
  };

  static delete = async (userId: string, encryptedRefreshToken: string) => {
    return UserSchema.findByIdAndUpdate(
      userId,
      { $pull: { refresh_tokens: { encrypted_jwt: encryptedRefreshToken } } },
      { new: true },
    );
  };

  static deleteAllByUserId = async (userId: string): Promise<boolean> => {
    const result = await UserSchema.findByIdAndUpdate(userId, { $set: { refresh_tokens: [] } }, { new: true });
    return result !== null;
  };
}
```

## TokenRefreshController (rotation)

```ts
// controllers/token-refresh.controller.ts
import { NextResponse } from 'next/server';
import { getRefreshToken, setCookies } from '@/lib/server/cookie';
import { decrypt, encrypt } from '@/lib/server/crypto';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '@/lib/server/jwt';
import { UserController } from './user.controller';
import { RefreshTokenController } from './refresh-token.controller';
import type { AuthResult, TokenRefreshResultData } from '@/model/auth';

export class TokenRefreshController {
  static handleRefreshTokenRequest = async (req: Request): Promise<NextResponse> => {
    try {
      let refreshToken = await getRefreshToken();
      if (!refreshToken) {
        try { refreshToken = (await req.json()).refresh_token; } catch { /* ignore */ }
      }
      if (!refreshToken) {
        return NextResponse.json({ status: 'error', statusCode: 401, message: 'Refresh token required' }, { status: 401 });
      }
      const result = await this.refresh(refreshToken);
      if (result.status === 'success' && result.data) {
        await setCookies(result.data.access_token, result.data.refresh_token);
      }
      return NextResponse.json(result, { status: result.statusCode });
    } catch (error) {
      console.error('Refresh token error:', error);
      return NextResponse.json({ status: 'error', message: 'Internal server error' }, { status: 500 });
    }
  };

  static refresh = async (refreshToken: string): Promise<AuthResult<TokenRefreshResultData>> => {
    let userId: string;
    let email: string;
    try {
      const decoded = verifyRefreshToken(refreshToken) as Record<string, unknown>;
      userId = decoded['x-user-id'] as string;
      email = decoded['x-email'] as string;
    } catch {
      return { status: 'error', statusCode: 401, message: 'Unauthorized, invalid token' };
    }
    if (!userId) return { status: 'error', statusCode: 404, message: 'User not found' };

    const tokens = await RefreshTokenController.getByUserId(userId);
    if (tokens.length === 0) return { status: 'error', statusCode: 401, message: 'No refresh tokens' };

    let matchedEncrypted: string | null = null;
    for (const t of tokens) {
      try {
        if (decrypt(t.encrypted_jwt) === refreshToken) {
          matchedEncrypted = t.encrypted_jwt;
          break;
        }
      } catch { /* continue */ }
    }
    if (!matchedEncrypted) return { status: 'error', statusCode: 401, message: 'No valid token' };

    const newAccess = generateAccessToken(userId, email);
    const newRefresh = generateRefreshToken(userId, email);
    const encryptedNew = encrypt(newRefresh);

    await RefreshTokenController.delete(userId, matchedEncrypted);
    await RefreshTokenController.post(userId, encryptedNew);

    void UserController.updateLastAccess(userId);

    return {
      status: 'success',
      statusCode: 200,
      message: 'Tokens refreshed',
      data: { access_token: newAccess, refresh_token: newRefresh },
    };
  };
}
```

## SignupController and MeController

Follow the same shape: `handle*Request` reads the body, calls a typed method that returns `AuthResult<T>`, sets cookies on success, builds `NextResponse`. See the source project for the full signup with OTP and anonymous signup flows.

The `MeController.handleGetMeRequest` selects the user excluding `password`, `refresh_tokens`, `reset_password_token`, `reset_password_expires`:

```ts
const user = await UserController.getById(userId, ['password', 'refresh_tokens', 'reset_password_expires', 'reset_password_token']);
return { status: 'success', statusCode: 200, message: 'User found', data: { ...user.toObject(), _id: user._id.toString() } };
```

## Rules

- Controllers never read `process.env` directly. Use `Config`.
- Controllers return `NextResponse` from `handle*Request`, typed data from internal methods.
- Password hashing uses `bcrypt.hash(password, 10)`.
- Refresh tokens are encrypted with `encrypt()` before storing, decrypted with `decrypt()` when comparing.
- Rotation: on refresh, delete the presented token, insert a new one. Never reuse a refresh token.
- `updateLastAccess` is fire-and-forget (`void`), never throws.