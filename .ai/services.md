# Service patterns: route handlers, controllers, clients

## Route handlers

Route handlers live in `app/api/<resource>/route.ts`. They are thin: compose `withDB` and `withAuth` wrappers, then delegate to a controller.

```ts
// app/api/wiki/route.ts
import { WikiStore } from '@/lib/server/stores/wiki-store';
import { withAuth } from '@/middlewares/auth-wrapper';
import { withDB } from '@/middlewares/db-wrapper';
import { NextResponse } from 'next/server';

export const GET = withDB(withAuth(async (_req, { auth }) => {
  const store = new WikiStore(auth.userId);
  const [roots, recentDocuments] = await Promise.all([
    store.listRoots(),
    store.getRecentDocuments(20),
  ]);
  return NextResponse.json({ roots, recentDocuments });
}));
```

```ts
// app/api/wiki/[id]/route.ts
import { WikiStore } from '@/lib/server/stores/wiki-store';
import { withAuth } from '@/middlewares/auth-wrapper';
import { withDB } from '@/middlewares/db-wrapper';
import { NextResponse, type NextRequest } from 'next/server';

export const GET = withDB(withAuth(async (
  _req: NextRequest,
  { params, auth }: { params: Promise<{ id: string }>; auth: { userId: string; email: string } },
) => {
  const { id } = await params;
  const store = new WikiStore(auth.userId);
  const doc = await store.getDocument(id);
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(doc);
}));

export const DELETE = withDB(withAuth(async (
  _req: NextRequest,
  { params, auth }: { params: Promise<{ id: string }>; auth: { userId: string; email: string } },
) => {
  const { id } = await params;
  const store = new WikiStore(auth.userId);
  await store.deleteDocument(id);
  return NextResponse.json({ ok: true });
}));
```

### Rules

- Always unwrap `params` with `await` (Next.js 15+ Promise params).
- Compose `withDB(withAuth(...))`. `withDB` first (connects DB), `withAuth` second (extracts user from headers set by the proxy).
- The route handler does not call Mongoose directly. It creates a store or calls a controller.
- Return `NextResponse.json(...)` with an explicit status for errors.

### Public routes

Public routes (no auth) skip `withAuth` but keep `withDB` if they touch the DB:

```ts
// app/api/contact/route.ts
import { ContactController } from '@/controllers/contact.controller';

export async function POST(req: Request) {
  return ContactController.handleContactRequest(req);
}
```

The proxy allowlist (`PUBLIC_API_PREFIXES`) must include the path prefix for the route to be reachable without a token.

### Webhook routes

Webhooks verify the signature in the route handler (or a dedicated controller), then process the event. They are public routes (no JWT) but verify a provider-specific signature header.

```ts
// app/api/webhooks/paddle/route.ts
import { PaddleController } from '@/controllers/paddle.controller';
import { withDB } from '@/middlewares/db-wrapper';
import { type NextRequest } from 'next/server';

export const POST = withDB(async (req: NextRequest) => {
  return PaddleController.handleWebhookRequest(req);
});
```

---

## Controllers

Controllers are static classes in `controllers/`. They hold business logic, return `NextResponse`, and are the only place that builds HTTP responses.

```ts
// controllers/login.controller.ts
import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';
import { UserController } from './user.controller';
import { setCookies } from '@/lib/server/cookie';
import { generateAccessToken, generateRefreshToken } from '@/lib/server/jwt';
import type { AuthResult, LoginResultData } from '@/model/auth';

export class LoginController {
  public static handleLoginRequest = async (req: Request): Promise<NextResponse> => {
    try {
      const body = await req.json();
      const { email, password } = body;
      const result = await this.login(email, password);
      if (result.status === 'success' && result.data) {
        const { access_token, refresh_token } = result.data;
        await setCookies(access_token, refresh_token);
        return NextResponse.json(result, { status: result.statusCode });
      }
      return NextResponse.json(result, { status: result.statusCode });
    } catch (error) {
      console.error('Login error:', error);
      return NextResponse.json({ status: 'error', message: 'Internal server error' }, { status: 500 });
    }
  };

  public static login = async (email: string, password: string): Promise<AuthResult<LoginResultData>> => {
    if (!email || !password) {
      return { status: 'error', statusCode: 400, message: 'Email and password are required' };
    }
    const user = await UserController.getUserByEmail(email.trim().toLowerCase());
    if (!user) {
      return { status: 'error', statusCode: 401, message: 'Invalid email or password' };
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return { status: 'error', statusCode: 401, message: 'Invalid email or password' };
    }
    const accessToken = generateAccessToken(user._id.toString(), user.email);
    const refreshToken = generateRefreshToken(user._id.toString(), user.email);
    return {
      status: 'success',
      statusCode: 200,
      message: 'Login successful',
      data: { access_token: accessToken, refresh_token: refreshToken, user: user.toObject() },
    };
  };
}
```

### `AuthResult` envelope

Auth and most controller methods return a typed `AuthResult<T>`:

```ts
export interface AuthResult<T = undefined> {
  status: 'success' | 'error';
  statusCode: number;
  message: string;
  data?: T;
}
```

The `handle*Request` method wraps the typed method, sets cookies if needed, and builds the `NextResponse`.

### Rules

- Controllers return `NextResponse` from `handle*Request` methods.
- Internal methods return typed data (`AuthResult<T>`, entities, DTOs), not `NextResponse`.
- Controllers do not read `process.env` directly. Use `Config`.
- Controllers are static classes, no instances, no state.
- One controller file per resource: `controllers/<resource>.controller.ts`.

### Response helpers

For non-auth routes, use the response helpers or return plain `NextResponse.json`:

```ts
export function successResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ status: 'success', data }, { status });
}

export function errorResponse(message: string, status = 500): NextResponse {
  return NextResponse.json({ status: 'error', message }, { status });
}

export function unauthorizedResponse(): NextResponse {
  return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
}

export function notFoundResponse(message = 'Not found'): NextResponse {
  return NextResponse.json({ status: 'error', message }, { status: 404 });
}
```

---

## Wrappers

### `withAuth`

Extracts auth from headers set by the proxy. Passes `auth: { userId, email }` to the handler.

```ts
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

### `withDB`

Ensures the DB connection is established before the handler runs.

```ts
export function withDB<T>(handler: RouteHandler<T>): RouteHandler<T> {
  return async (req, context) => {
    await connectDB();
    return handler(req, context);
  };
}
```

### `withAdminCheck`

For admin-only routes, checks `Config.app.admin_user_id` against the JWT user ID.

```ts
export function withAdminCheck<T>(handler: RouteHandler<T>) {
  return async (req: NextRequest, context: { params: Promise<T> }) => {
    const errorResponse = await checkAdmin(req);
    if (errorResponse) return errorResponse;
    return handler(req, context);
  };
}
```

Compose: `export const GET = withDB(withAdminCheck(withAuth(async (...) => { ... })));`

---

## Server-side JWT

Use `jsonwebtoken` server-side (not Edge). `jose` is only for the proxy middleware.

```ts
// lib/server/jwt.ts
import 'server-only';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { Config } from './config';

export function generateAccessToken(userId: string, email: string): string {
  const options: SignOptions = { expiresIn: Config.jwt.access_token_expires_in as SignOptions['expiresIn'] };
  if (Config.jwt.issuer) options.issuer = Config.jwt.issuer;
  if (Config.jwt.audience) options.audience = Config.jwt.audience;
  return jwt.sign({ 'x-user-id': userId, 'x-email': email }, Config.jwt.access_token_secret, options);
}

export function verifyRefreshToken(token: string): string | jwt.JwtPayload {
  return jwt.verify(token, Config.jwt.refresh_token_secret);
}
```

---

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
  cookieStore.set('access_token', accessToken, { ...cookieOptions, maxAge: Config.jwt.cookie_refresh_token_max_age });
  cookieStore.set('refresh_token', refreshToken, { ...cookieOptions, maxAge: Config.jwt.cookie_refresh_token_max_age });
};

export const clearCookies = async () => {
  const cookieStore = await cookies();
  cookieStore.set('access_token', '', { ...cookieOptions, expires: new Date(0) });
  cookieStore.set('refresh_token', '', { ...cookieOptions, expires: new Date(0) });
};
```

The access_token cookie maxAge is bound to the refresh token lifetime, not the access JWT lifetime. If the cookie expired with the JWT, the browser would drop it silently and the server would return `token_not_found` instead of `token_expired`, breaking the refresh flow.

---

## Encryption

Refresh tokens are encrypted at rest with AES-256-GCM before storing in the DB.

```ts
// lib/server/crypto.ts
import 'server-only';
import crypto from 'crypto';
import { Config } from './config';

const IV_LENGTH = 16;
const GCM_PREFIX = 'gcm';

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
  // legacy CBC fallback for old ciphertexts
  // ...
}
```

---

## Client API

### `client.fetch`

Browser fetch goes through a single `Client` class that handles 401 refresh, dedupe, and error dialogs.

```ts
// lib/client/client.ts
import { Dialog } from '@/lib/client/dialog';
import { ApiError } from './api-error';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || '';
const RE_AUTH_ERRORS = ['token_invalid', 'user_not_found', 'malformed_token'];
const REFRESHABLE_ERRORS = ['token_expired', 'token_not_found'];

export class Client {
  baseUrl: string;
  private refreshTokenPromise: Promise<Response> | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async fetch(url: string, init?: RequestInit): Promise<Response> {
    const headers = { 'Content-Type': 'application/json', ...(init?.headers || {}) };
    let response = await fetch(this.baseUrl + url, { ...init, headers, credentials: 'include' });
    if (response.status === 401) {
      response = await this.handle401(response, url, init, headers);
    } else if (!response.ok) {
      await this.handleError(response);
    }
    return response;
  }

  private async handle401(response: Response, url: string, init: RequestInit | undefined, headers: HeadersInit): Promise<Response> {
    const body = await response.clone().json().catch(() => ({}));
    const error = body.error;
    if (REFRESHABLE_ERRORS.includes(error ?? '')) {
      const refreshed = await this.refreshAccessToken(headers);
      if (refreshed) return await this.fetch(url, { ...init, headers });
      await this.reauth();
      return response;
    }
    if (RE_AUTH_ERRORS.includes(error ?? '')) {
      await this.reauth();
      return response;
    }
    await Dialog.alert({ title: 'Request failed', description: body.message ?? response.statusText });
    return response;
  }

  private async refreshAccessToken(headers?: HeadersInit): Promise<boolean> {
    if (!this.refreshTokenPromise) {
      this.refreshTokenPromise = fetch(this.baseUrl + '/auth/refresh', { method: 'POST', headers, credentials: 'include' });
    }
    try {
      const res = await this.refreshTokenPromise;
      return res.ok;
    } finally {
      this.refreshTokenPromise = null;
    }
  }

  private async reauth() {
    const confirmed = await Dialog.confirm({
      title: 'Session expired',
      description: 'Your session has expired. Please login again.',
      confirmText: 'Go to login',
      cancelText: 'Stay here',
    });
    if (confirmed) {
      window.location.href = '/auth';
    }
  }
}

export const client = new Client(API_URL);
```

### API classes

Static classes per resource, calling `client.fetch`:

```ts
// api/wiki-api.ts
import { client } from '@/lib/client/client';
import type { WikiDocumentDto, WikiDocumentSummary } from '@/model/wiki-document';

export class WikiApi {
  static async getTree(): Promise<WikiDocumentSummary[]> {
    const res = await client.fetch(`/wiki/tree`);
    const data = await res.json();
    return data.documents ?? [];
  }

  static async createDocument(input: CreateDocumentInput): Promise<WikiDocumentDto> {
    const res = await client.fetch(`/wiki/documents`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return await res.json();
  }

  static async deleteDocument(id: string): Promise<void> {
    await client.fetch(`/wiki/documents/${id}`, { method: 'DELETE' });
  }
}
```

### Uploads

For multipart uploads, do not set `Content-Type`, the browser sets the boundary:

```ts
async upload(url: string, formData: FormData): Promise<Response> {
  return fetch(this.baseUrl + url, { method: 'POST', body: formData, credentials: 'include' });
}
```

---

## React Query hooks

See `.ai/architecture.md` for the full hook pattern. Summary:

- `hooks/<resource>.hook.ts` exports query key constants and `use<Resource>` hooks.
- `useQuery` for reads, `useMutation` for writes.
- `onSuccess` invalidates affected query keys.
- Use `{ exact: true }` when invalidating a deleted resource.

---

## SSE streaming

For AI chat, the server returns `text/event-stream` (or newline-delimited JSON). The client reads the stream with a `ReadableStream` reader.

```ts
// api/chat-api.ts
export class ChatApi {
  static async *streamChat(body: ChatRequestBody): AsyncGenerator<string> {
    const response = await fetch(`${client.baseUrl}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      credentials: 'include',
    });
    if (!response.body) return;
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          yield line.slice(6);
        } else if (line.trim()) {
          yield line;
        }
      }
    }
  }
}
```

See `.ai/skills/nextjs-agent-kit-ai-chat/SKILL.md` for the full server and client implementation.

---

## Custom exceptions

Define typed exceptions per domain:

```ts
// lib/client/api-error.ts
export class ApiError extends Error {
  constructor(public code: string) {
    super(code);
  }
}
```

```ts
// lib/server/openrouter.ts
export class OpenRouterError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'OpenRouterError';
  }
}
```

Do not throw raw strings. Controllers catch typed errors and map them to `AuthResult` or `NextResponse`.