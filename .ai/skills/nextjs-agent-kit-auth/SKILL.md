---
name: nextjs-agent-kit-auth
description: >-
  Add authentication to a Next.js app built on the Next.js Agent Kit. Use when
  implementing login, signup, token refresh, 401 handling, session expiry,
  account management, Google OAuth (web or mobile), Apple mobile auth, or
  password reset. Covers JWT in httpOnly cookies, token rotation, the proxy
  middleware with jose, controllers for login/signup/refresh/logout, the
  client fetch wrapper with 401 refresh, and the useUser/useAuth hooks.
---

# How to add auth

Auth is **opt-in**. The kit ships no auth code. Build it when your app needs login, signup, token refresh, and account management.

This guide shows how to build the feature from scratch. It covers the models, the proxy JWT verification, the controllers, the client fetch wrapper with 401 refresh, the React Query hooks, and the login/signup screens.

## What you need to build

```
model/
  user.ts                       # User interface (backend + DTO)
  auth.ts                       # AuthResult, LoginResultData, SignupResultData, RefreshToken
  refresh-token.ts              # RefreshToken interface
schemas/
  user.schema.ts                # Mongoose User schema, indexes
  otp.schema.ts                 # OTP for email verification (optional)
lib/server/
  config.ts                     # Config.jwt, Config.google_auth, Config.apple_auth sections
  jwt.ts                        # generateAccessToken, generateRefreshToken, verifyRefreshToken (jsonwebtoken)
  crypto.ts                     # encrypt, decrypt (AES-256-GCM) for refresh token at rest
  cookie.ts                     # setCookies, clearCookies, getRefreshToken
proxy/
  jwt-auth.ts                   # JwtAuth.authenticate, Edge Runtime, jose
  proxy-handle.ts               # Proxy.handle, PUBLIC_API_PREFIXES, rate limit
  rate-limiter.ts               # RateLimiter.check
middlewares/
  auth-wrapper.ts               # withAuth
  db-wrapper.ts                 # withDB
  admin-check.ts                # withAdminCheck
controllers/
  user.controller.ts            # getUserByEmail, post, patch, getById
  login.controller.ts           # handleLoginRequest, login, logout
  signup.controller.ts          # handleSignupRequest, signup, sendEmailVerification
  refresh-token.controller.ts   # post, delete, deleteAllByUserId
  token-refresh.controller.ts   # handleRefreshTokenRequest, refresh (rotation)
  password.controller.ts        # handleForgotPasswordRequest, handleResetPasswordRequest
  me.controller.ts              # handleGetMeRequest, handleDeleteMeRequest
  google-auth.controller.ts     # handleAuthRequest, handleCallbackRequest, authenticateGoogleProfile
  google-mobile-auth.controller.ts  # signInWithGoogleIdToken
  apple-mobile-auth.controller.ts   # signInWithAppleCredential
  apple-token.service.ts        # AppleTokenService (verify identity_token)
lib/client/
  client.ts                     # Client class, client.fetch with 401 refresh, reauth dialog
  auth-api.ts                   # AuthApi static methods
  user-api.ts                   # UserApi.getMe, deleteAccount
  dialog.ts                     # Dialog.alert/confirm/prompt (see dialogs skill)
hooks/
  user.hook.ts                  # useUser (React Query)
  auth.hook.ts                  # useAuth (login, signup, logout, deleteAccount actions)
app/api/auth/
  login/route.ts                # POST
  logout/route.ts               # POST
  refresh/route.ts              # POST
  signup/route.ts               # POST
  signup/anonymous/route.ts     # POST (optional)
  signup/send-email-verification/route.ts  # POST (optional)
  me/route.ts                   # GET, DELETE
  me/picture/route.ts           # PUT (optional)
  password/forgot/route.ts      # POST
  password/reset/route.ts       # POST
  google/login/route.ts         # GET
  google/signup/route.ts        # GET
  google/callback/route.ts      # GET
app/auth/
  page.tsx                      # Login/signup tabs
  authenticated/page.tsx        # redirect to /app
  password/reset/route.ts       # serve reset HTML (optional)
  password/reset-success/route.ts
proxy.ts                        # middleware wiring
```

## Steps

| step | reference | what |
| ---- | --------- | ---- |
| 0 | `references/models_and_schemas.md` | User interface + schema, RefreshToken, OTP, AuthResult types |
| 1 | `references/jwt_and_cookies.md` | Config.jwt, generateAccessToken/RefreshToken, encrypt/decrypt, setCookies/clearCookies |
| 2 | `references/proxy.md` | JwtAuth (jose, Edge), Proxy.handle, PUBLIC_API_PREFIXES, withAuth, withDB |
| 3 | `references/controllers.md` | UserController, LoginController, SignupController, TokenRefreshController (rotation), PasswordController, MeController |
| 4 | `references/client.md` | Client class with 401 refresh + dedupe + reauth dialog, AuthApi, UserApi |
| 5 | `references/hooks.md` | useUser (React Query), useAuth actions, queryClient.resetQueries on login |
| 6 | (below) | Wire the route handlers |
| 7 | (below) | Build the login/signup screen |
| 8 | `references/social_google.md` | Optional: Google OAuth (web redirect + mobile id_token) |
| 9 | `references/social_apple.md` | Optional: Apple mobile auth |
| 10 | `references/password_reset.md` | Optional: password reset with email + token |

## Step 6: Wire the route handlers

Each route handler is thin, composing `withDB` and `withAuth` and delegating to the controller.

```ts
// app/api/auth/login/route.ts
import { LoginController } from '@/controllers/login.controller';
import { withDB } from '@/middlewares/db-wrapper';

export const POST = withDB(async (req: Request) => {
  return LoginController.handleLoginRequest(req);
});
```

```ts
// app/api/auth/me/route.ts
import { MeController } from '@/controllers/me.controller';
import { withAuth } from '@/middlewares/auth-wrapper';
import { withDB } from '@/middlewares/db-wrapper';
import { type NextRequest } from 'next/server';

export const GET = withDB(withAuth(async (_req: NextRequest, { auth }) => {
  return MeController.handleGetMeRequest(auth.userId);
}));

export const DELETE = withDB(withAuth(async (_req: NextRequest, { auth }) => {
  return MeController.handleDeleteMeRequest(auth.userId);
}));
```

```ts
// app/api/auth/refresh/route.ts
import { TokenRefreshController } from '@/controllers/token-refresh.controller';
import { withDB } from '@/middlewares/db-wrapper';

export const POST = withDB(async (req: Request) => {
  return TokenRefreshController.handleRefreshTokenRequest(req);
});
```

Update `proxy.ts` `PUBLIC_API_PREFIXES` to include `/api/auth/google`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/password`, `/api/auth/refresh`, `/api/auth/signup`.

## Step 7: Build the login/signup screen

`app/auth/page.tsx` is a client component with login/signup tabs. On success, `window.location.href = '/app'` to trigger a full reload so the access_token cookie is sent.

```tsx
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/hooks/auth.hook';

export default function AuthPage() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    let ok: boolean;
    if (mode === 'login') {
      ok = await login(email, password);
    } else {
      ok = await signup(email, password);
    }
    setIsLoading(false);
    if (ok) {
      window.location.href = '/app';
    }
  };

  return (
    <form onSubmit={onSubmit}>
      {/* tabs, inputs, error, submit */}
    </form>
  );
}
```

The full UI uses shadcn `Tabs`, `Input`, `Button`. See the dialogs skill for the `Dialog.confirm` session-expired flow used by `client.ts`.

## Anti-patterns

| anti-pattern | reason | do instead |
| --- | --- | --- |
| Storing access tokens in localStorage | XSS exposure | httpOnly cookies via `setCookies` |
| Access cookie maxAge = access JWT lifetime | Browser drops cookie, server returns `token_not_found` instead of `token_expired`, refresh flow breaks | Bind access cookie maxAge to refresh token lifetime |
| Not rotating refresh tokens | Stolen tokens remain valid | Rotate on every refresh: delete presented, insert new |
| Storing refresh tokens in plain text | DB leak exposes valid tokens | Encrypt at rest with AES-256-GCM |
| Verifying JWT in route handlers | Duplicated logic, wrong library (jsonwebtoken is not Edge-safe) | Verify once in `proxy.ts` with jose, forward `x-user-id` header |
| Fat route handlers with bcrypt + Mongoose calls | Untestable, duplicated | Delegate to controllers |
| `useEffect` to check auth on load | Race conditions, flash of wrong content | `useUser` React Query hook, render `null` while loading |

## Checklist

- [ ] `model/user.ts` + `schemas/user.schema.ts` created
- [ ] `lib/server/jwt.ts`, `crypto.ts`, `cookie.ts` created
- [ ] `proxy/jwt-auth.ts`, `proxy/proxy-handle.ts`, `proxy/rate-limiter.ts` created
- [ ] `middlewares/auth-wrapper.ts`, `db-wrapper.ts` created
- [ ] `controllers/user.controller.ts`, `login.controller.ts`, `signup.controller.ts`, `token-refresh.controller.ts`, `me.controller.ts` created
- [ ] `lib/client/client.ts` with 401 refresh + reauth dialog created
- [ ] `hooks/user.hook.ts`, `hooks/auth.hook.ts` created
- [ ] `app/api/auth/*` route handlers created
- [ ] `proxy.ts` middleware wired with `PUBLIC_API_PREFIXES`
- [ ] `app/auth/page.tsx` login/signup screen created
- [ ] `.env.local` has `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`, `ENCRYPTION_KEY` (64-char hex)
- [ ] `npm run lint && tsc --noEmit` pass
- [ ] `changes/` entry created