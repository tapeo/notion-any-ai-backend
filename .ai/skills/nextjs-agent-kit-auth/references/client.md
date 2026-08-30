# Client fetch with 401 refresh

## Client class

```ts
// lib/client/client.ts
import { Dialog } from '@/lib/client/dialog';
import { ApiError } from './api-error';
import { AuthApi } from './auth-api';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || '';
const RE_AUTH_ERRORS = ['token_invalid', 'user_not_found', 'malformed_token'];
const REFRESHABLE_ERRORS = ['token_expired', 'token_not_found'];

type ErrorBody = { error?: string; code?: string; message?: string };

async function parseBody(response: Response): Promise<ErrorBody> {
  return (await response.clone().json().catch(() => ({}))) as ErrorBody;
}

export class Client {
  baseUrl: string;
  private refreshTokenPromise: Promise<Response> | null = null;
  private reauthPromptPromise: Promise<void> | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async fetch(url: string, init?: RequestInit): Promise<Response> {
    const headers = { 'Content-Type': 'application/json', ...(init?.headers || {}) };
    let method = init?.method;
    if (!method) method = 'GET';

    let response = await fetch(this.baseUrl + url, { ...init, headers, credentials: 'include' });
    console.log(`[Client] ${method} ${decodeURIComponent(url)} -> ${response.status}`);

    if (response.status === 401) {
      response = await this.handle401(response, url, init, headers);
    } else if (!response.ok) {
      await this.handleError(response);
    }
    return response;
  }

  async upload(url: string, formData: FormData): Promise<Response> {
    const uri = this.baseUrl + url;
    let response = await fetch(uri, { method: 'POST', body: formData, credentials: 'include' });
    if (response.status !== 401) return response;

    const body = await parseBody(response);
    if (REFRESHABLE_ERRORS.includes(body.error ?? '')) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        response = await fetch(uri, { method: 'POST', body: formData, credentials: 'include' });
      } else {
        await this.reauth();
      }
      return response;
    }
    if (RE_AUTH_ERRORS.includes(body.error ?? '')) await this.reauth();
    return response;
  }

  async logout() {
    AuthApi.logout().finally(() => {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/auth';
    });
  }

  private async handle401(response: Response, url: string, init: RequestInit | undefined, headers: HeadersInit): Promise<Response> {
    const body = await parseBody(response);
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

  private async handleError(response: Response): Promise<void> {
    const body = await parseBody(response);
    if (body.code) throw new ApiError(body.code);
    await Dialog.alert({ title: 'Request failed', description: body.message ?? response.statusText });
  }

  private async refreshAccessToken(headers?: HeadersInit): Promise<boolean> {
    if (!this.refreshTokenPromise) {
      this.refreshTokenPromise = fetch(this.baseUrl + '/auth/refresh', {
        method: 'POST',
        headers,
        credentials: 'include',
      });
    }
    try {
      const res = await this.refreshTokenPromise;
      return res.ok;
    } finally {
      this.refreshTokenPromise = null;
    }
  }

  private async reauth() {
    if (this.reauthPromptPromise) {
      await this.reauthPromptPromise;
      return;
    }
    this.reauthPromptPromise = (async () => {
      const confirmed = await Dialog.confirm({
        title: 'Session expired',
        description: 'Your session has expired. Please login again.',
        confirmText: 'Go to login',
        cancelText: 'Stay here',
      });
      if (confirmed) await this.logout();
    })();
    await this.reauthPromptPromise;
    this.reauthPromptPromise = null;
  }
}

export const client = new Client(API_URL);
```

## Why dedupe refresh

If multiple requests fail with 401 at the same time, only the first triggers a `/auth/refresh` call. The others await the same `refreshTokenPromise`. Without dedupe, N concurrent 401s would trigger N refresh calls, each rotating the refresh token, invalidating the others, and logging the user out.

## Why the reauth prompt is deduped

If multiple requests fail after refresh also fails (refresh token expired), only one "Session expired" dialog shows. The others await the same `reauthPromptPromise`.

## AuthApi and UserApi

```ts
// lib/client/auth-api.ts
import { client } from './client';

export class AuthApi {
  static async logout(): Promise<void> {
    await client.fetch('/auth/logout', { method: 'POST' });
  }

  static async sendEmailVerification(email: string): Promise<void> {
    await client.fetch('/auth/signup/send-email-verification', { method: 'POST', body: JSON.stringify({ email }) });
  }

  static async forgotPassword(email: string): Promise<void> {
    await client.fetch('/auth/password/forgot', { method: 'POST', body: JSON.stringify({ email }) });
  }

  static async resetPassword(formData: FormData): Promise<void> {
    await client.fetch('/auth/password/reset', { method: 'POST', body: formData });
  }
}
```

```ts
// lib/client/user-api.ts
import { client } from './client';
import type { User } from '@/model/user';

export class UserApi {
  static async getMe(): Promise<User> {
    const res = await client.fetch('/auth/me');
    const json = await res.json();
    return json.data as User;
  }

  static async deleteAccount(): Promise<void> {
    await client.fetch('/auth/me', { method: 'DELETE' });
  }
}
```

## Login does not use client.fetch

Login and signup use `fetch` directly, not `client.fetch`, because they run before the user has an access token. On success, the server sets the cookies, and the client does `window.location.href = '/app'` to reload and pick up the cookie.

```ts
const response = await fetch(`${client.baseUrl}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
  credentials: 'include',
});
if (response.ok) {
  queryClient.resetQueries();
  window.location.href = '/app';
}
```

`queryClient.resetQueries()` clears any cached data from a previous anonymous session.