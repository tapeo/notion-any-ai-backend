# Proxy middleware

## JwtAuth (Edge Runtime, jose)

The middleware runs in the Edge Runtime, so it uses `jose`, not `jsonwebtoken`.

```ts
// proxy/jwt-auth.ts
import { Config } from '@/lib/server/config';
import * as jose from 'jose';
import { NextResponse, type NextRequest } from 'next/server';

export enum JwtError {
  TOKEN_EXPIRED = 'token_expired',
  TOKEN_INVALID = 'token_invalid',
  TOKEN_NOT_FOUND = 'token_not_found',
  USER_NOT_FOUND = 'user_not_found',
  MALFORMED_TOKEN = 'malformed_token',
}

export interface JwtPayload {
  user_id: string;
  email: string;
  payload: jose.JWTPayload;
}

export interface JwtAuthResult {
  success: boolean;
  response?: NextResponse;
  userId?: string;
  email?: string;
  payload?: jose.JWTPayload;
}

export class JwtAuth {
  static async authenticate(request: NextRequest): Promise<JwtAuthResult> {
    const accessToken = this.extractAccessToken(request);
    if (!accessToken) {
      return {
        success: false,
        response: this.createErrorResponse('Unauthorized, access token not found', JwtError.TOKEN_NOT_FOUND, 401),
      };
    }
    try {
      const { userId, email, payload } = await this.verifyAndDecodeToken(accessToken);
      if (!userId) {
        return { success: false, response: this.createErrorResponse('Unauthorized, user not found', JwtError.USER_NOT_FOUND, 404) };
      }
      return { success: true, userId, email, payload };
    } catch (error) {
      return { success: false, response: this.handleJwtError(error) };
    }
  }

  static createAuthenticatedResponse(
    request: NextRequest,
    userId: string,
    email: string | undefined,
    payload: jose.JWTPayload,
  ): NextResponse {
    const headers = new Headers(request.headers);
    headers.set('x-user-id', userId);
    headers.set('x-user-email', email || '');
    headers.set('x-jwt-payload', JSON.stringify(payload));
    return NextResponse.next({ request: { headers } });
  }

  static getFromHeaders(request: NextRequest): JwtPayload | null {
    const userId = request.headers.get('x-user-id');
    if (!userId) return null;
    const payloadStr = request.headers.get('x-jwt-payload');
    let payload: jose.JWTPayload = {};
    if (payloadStr) {
      try { payload = JSON.parse(payloadStr); } catch { /* ignore */ }
    }
    return { user_id: userId, email: request.headers.get('x-user-email') || '', payload };
  }

  static extractAccessToken(request: NextRequest): string | undefined {
    const authHeader = request.headers.get('authorization');
    return authHeader?.split(' ')[1] ?? request.cookies.get('access_token')?.value;
  }

  private static async verifyAndDecodeToken(accessToken: string) {
    const secret = new TextEncoder().encode(Config.jwt.access_token_secret);
    const { payload } = await jose.jwtVerify(accessToken, secret);
    return {
      userId: payload['x-user-id'] as string | undefined,
      email: payload['x-email'] as string | undefined,
      payload,
    };
  }

  private static createErrorResponse(message: string, error: JwtError, status: number, clearCookies = false): NextResponse {
    const response = NextResponse.json({ status: 'error', message, error }, { status });
    if (clearCookies) {
      response.cookies.set('access_token', '', { expires: new Date(0) });
      response.cookies.set('refresh_token', '', { expires: new Date(0) });
    }
    return response;
  }

  private static handleJwtError(error: unknown): NextResponse {
    if (error instanceof jose.errors.JWTExpired) {
      return this.createErrorResponse('Unauthorized, access token expired', JwtError.TOKEN_EXPIRED, 401);
    }
    return this.createErrorResponse('Unauthorized, invalid access token', JwtError.TOKEN_INVALID, 401, true);
  }
}
```

## Proxy.handle

```ts
// proxy/proxy-handle.ts
import { NextResponse, type NextRequest } from 'next/server';
import { JwtAuth } from './jwt-auth';
import { RateLimiter } from './rate-limiter';

export class Proxy {
  private static readonly API_PREFIX = '/api';

  private static readonly PUBLIC_API_PREFIXES = [
    '/api/auth/google',
    '/api/auth/login',
    '/api/auth/logout',
    '/api/auth/password',
    '/api/auth/refresh',
    '/api/auth/signup',
    '/api/public',
    '/api/webhooks',
    '/api/contact',
  ];

  static isApi(pathname: string): boolean {
    return pathname.startsWith(this.API_PREFIX);
  }

  static isProtectedApi(pathname: string): boolean {
    if (!this.isApi(pathname)) return false;
    return !this.PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  }

  static async handle(request: NextRequest): Promise<NextResponse> {
    const { pathname } = request.nextUrl;
    if (request.method === 'OPTIONS') return NextResponse.next();
    if (this.isApi(pathname)) {
      const rateLimitResponse = RateLimiter.check(request, pathname);
      if (rateLimitResponse) return rateLimitResponse;
    }
    if (this.isProtectedApi(pathname)) {
      return this.handleProtectedRoute(request);
    }
    return NextResponse.next();
  }

  private static async handleProtectedRoute(request: NextRequest): Promise<NextResponse> {
    const result = await JwtAuth.authenticate(request);
    if (!result.success || !result.userId) return result.response!;
    return JwtAuth.createAuthenticatedResponse(request, result.userId, result.email, result.payload!);
  }
}
```

## proxy.ts

```ts
// proxy.ts (project root, Next.js middleware entry)
import { Config } from '@/lib/server/config';
import { Proxy } from '@/proxy/proxy-handle';
import { JwtAuth } from '@/proxy/jwt-auth';
import { NextRequest, NextResponse } from 'next/server';

export default async function proxy(request: NextRequest) {
  const host = request.headers.get('host');
  if (process.env.NODE_ENV === 'production' && host && host.startsWith('www.')) {
    const url = request.nextUrl.clone();
    url.protocol = 'https';
    url.host = host.replace(/^www\./, '');
    url.port = '';
    return NextResponse.redirect(url, 308);
  }

  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/app/admin')) {
    const result = await JwtAuth.authenticate(request);
    const adminUserId = Config.app?.admin_user_id;
    const isAdmin = result.success && !!adminUserId && result.userId === adminUserId;
    if (!isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = '/app';
      url.search = '';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (pathname.startsWith('/api')) {
    return Proxy.handle(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)', '/opengraph-image', '/sitemap.xml', '/robots.txt'],
};
```

## withAuth and withDB

```ts
// middlewares/auth-wrapper.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromHeaders } from '@/lib/server/api-route';

export type RouteHandler<T = unknown> = (req: NextRequest, context: { params: Promise<T> }) => Promise<NextResponse | Response>;
export type RouteHandlerWithAuth<T = unknown> = (req: NextRequest, context: { params: Promise<T>; auth: { userId: string; email: string } }) => Promise<NextResponse | Response>;

export function withAuth<T>(handler: RouteHandlerWithAuth<T>): RouteHandler<T> {
  return async (req, context) => {
    const auth = getAuthFromHeaders(req);
    if (!auth) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }
    return handler(req, { ...context, auth });
  };
}
```

```ts
// middlewares/db-wrapper.ts
import connectDB from '@/lib/server/mongodb';
import { type NextRequest, type NextResponse } from 'next/server';

export function withDB<T>(handler: RouteHandler<T>): RouteHandler<T> {
  return async (req, context) => {
    await connectDB();
    return handler(req, context);
  };
}
```

Compose: `export const GET = withDB(withAuth(async (_req, { auth }) => { ... }));`

## Why verify in the proxy, not in route handlers

- Single source of truth for auth. Every protected route is guarded without each handler repeating verification.
- Edge Runtime compatible (`jose`). Route handlers can use the Node API freely.
- The proxy forwards `x-user-id`, `x-user-email`, `x-jwt-payload` headers. Route handlers read them via `withAuth` or `JwtAuth.getFromHeaders`. No DB lookup per request.
- Public routes are explicitly listed in `PUBLIC_API_PREFIXES`. Adding a new public route means updating that list, not removing auth from a handler.