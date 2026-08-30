# JWT and cookies

## Config

```ts
// lib/server/config.ts
import 'server-only';

export class Config {
  static readonly jwt = {
    access_token_secret: process.env.ACCESS_TOKEN_SECRET!,
    refresh_token_secret: process.env.REFRESH_TOKEN_SECRET!,
    access_token_expires_in: '1h',
    refresh_token_expires_in: '90d',
    cookie_access_token_max_age: 60 * 60,           // 1 hour
    cookie_refresh_token_max_age: 60 * 60 * 24 * 90, // 90 days
    issuer: process.env.DOMAIN,
    audience: process.env.DOMAIN,
  };
  static readonly crypto = {
    encryption_key: process.env.ENCRYPTION_KEY!,
  };
  static readonly app = {
    domain: process.env.DOMAIN!,
    env: process.env.ENV as 'development' | 'production',
  };
}
```

Generate secrets:

```bash
openssl rand -hex 32
```

## Token generation (server, jsonwebtoken)

```ts
// lib/server/jwt.ts
import 'server-only';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { Config } from './config';

export function generateAccessToken(userId: string, email: string): string {
  const options: SignOptions = {
    expiresIn: Config.jwt.access_token_expires_in as SignOptions['expiresIn'],
  };
  if (Config.jwt.issuer) options.issuer = Config.jwt.issuer;
  if (Config.jwt.audience) options.audience = Config.jwt.audience;
  return jwt.sign({ 'x-user-id': userId, 'x-email': email }, Config.jwt.access_token_secret, options);
}

export function generateRefreshToken(userId: string, email: string): string {
  const options: SignOptions = {
    expiresIn: Config.jwt.refresh_token_expires_in as SignOptions['expiresIn'],
  };
  if (Config.jwt.issuer) options.issuer = Config.jwt.issuer;
  if (Config.jwt.audience) options.audience = Config.jwt.audience;
  return jwt.sign({ 'x-user-id': userId, 'x-email': email }, Config.jwt.refresh_token_secret, options);
}

export function verifyRefreshToken(token: string): string | jwt.JwtPayload {
  return jwt.verify(token, Config.jwt.refresh_token_secret);
}
```

The proxy uses `jose` (Edge Runtime). The server uses `jsonwebtoken` (Node API). Same secrets, same claims (`x-user-id`, `x-email`).

## Encryption (AES-256-GCM)

```ts
// lib/server/crypto.ts
import 'server-only';
import crypto from 'crypto';
import { Config } from './config';

const IV_LENGTH = 16;
const GCM_PREFIX = 'gcm';

function getKey(): Buffer {
  const key = Buffer.from(Config.crypto.encryption_key, 'hex');
  if (key.length !== 32) {
    throw new Error('Invalid encryption key length. Must be 32 bytes (64 hex chars).');
  }
  return key;
}

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-gcm', getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${GCM_PREFIX}:${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decrypt(text: string): string {
  if (text.startsWith(`${GCM_PREFIX}:`)) {
    const parts = text.split(':');
    const iv = Buffer.from(parts[1], 'hex');
    const tag = Buffer.from(parts[2], 'hex');
    const encryptedText = Buffer.from(parts.slice(3).join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', getKey(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(encryptedText), decipher.final()]).toString();
  }
  // legacy CBC fallback omitted for brevity, retain only if migrating old data
  throw new Error('Unsupported ciphertext format');
}
```

## Cookies

```ts
// lib/server/cookie.ts
import 'server-only';
import { cookies } from 'next/headers';
import { Config } from './config';

const isProduction = process.env.ENV === 'production';
const isLocalhost = Config.app.domain?.startsWith('localhost');
const cookieDomain = isLocalhost ? undefined : (Config.app.domain || undefined);

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax' as const,
  path: '/',
  domain: cookieDomain,
};

export const setCookies = async (accessToken: string, refreshToken: string) => {
  const cookieStore = await cookies();
  // Access cookie maxAge is bound to the refresh token lifetime, not the access
  // JWT lifetime. If it expired with the JWT, the browser would drop it
  // silently and the server would return token_not_found instead of
  // token_expired, breaking the refresh flow.
  cookieStore.set('access_token', accessToken, {
    ...cookieOptions,
    maxAge: Config.jwt.cookie_refresh_token_max_age,
  });
  cookieStore.set('refresh_token', refreshToken, {
    ...cookieOptions,
    maxAge: Config.jwt.cookie_refresh_token_max_age,
  });
};

export const clearCookies = async () => {
  const cookieStore = await cookies();
  cookieStore.set('access_token', '', { ...cookieOptions, expires: new Date(0) });
  cookieStore.set('refresh_token', '', { ...cookieOptions, expires: new Date(0) });
};

export const getRefreshToken = async (): Promise<string | undefined> => {
  const cookieStore = await cookies();
  return cookieStore.get('refresh_token')?.value;
};
```

## Why the access cookie outlives the access JWT

The access JWT expires in 1 hour. The access cookie must outlive it. When the JWT expires, the cookie is still sent to the server, the proxy verifies the JWT, sees it expired, and returns `token_expired`. The client refreshes. If the cookie expired with the JWT, the browser would drop it silently, the server would see no token and return `token_not_found`, and the refresh flow (which expects `token_expired` to trigger) would not run. The user would be logged out unexpectedly.