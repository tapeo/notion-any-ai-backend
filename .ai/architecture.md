# App Router architecture and state management

## App Router

### Server and client components

App Router components are server components by default. Add `'use client'` only when a component needs:

- React hooks (`useState`, `useEffect`, `useQuery`, `useRef`)
- Event handlers (`onClick`, `onChange`)
- Browser APIs (`window`, `document`, `localStorage`)
- jotai atoms

Keep server components lean: data fetching, layout, metadata. Push interactivity into client sub-components.

```tsx
// app/wiki/[id]/page.tsx (server component)
import { DocumentEditor } from '@/components/wiki/document-editor';
import { getDocument } from '@/lib/server/stores/wiki-store';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const doc = await getDocument(id);
  return <DocumentEditor doc={doc} />;
}
```

```tsx
// components/wiki/document-editor.tsx (client component)
'use client';

import { useState } from 'react';

export function DocumentEditor({ doc }: { doc: WikiDocumentDto }) {
  const [title, setTitle] = useState(doc.title);
  // ...
}
```

### `params` is a Promise (Next.js 15+)

Page components receive `params` as a Promise. Always unwrap with `await` in an async server component, or `use()` in a client component.

```tsx
// Server component
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // ...
}
```

```tsx
// Client component
import { use } from 'react';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  // ...
}
```

Never access `params.id` directly without unwrapping. It will be a Promise, not the value.

### Layouts

Layouts wrap all child routes. Use them for shared UI (navbar, sidebar, providers) and metadata. Layouts persist across route changes, so they are the right place for app shell state.

```tsx
// app/layout.tsx (root layout)
import { QueryProvider } from '@/components/providers/query-provider';
import { DialogProvider } from '@/components/providers/dialog-provider';
import { Geist } from 'next/font/google';
import './globals.css';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata = {
  title: { default: 'My app', template: '%s, My app' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body className="bg-background min-h-screen">
        <QueryProvider>
          <DialogProvider>
            {children}
          </DialogProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
```

```tsx
// app/app/layout.tsx (auth-gated section)
import { AppShell } from './app-shell';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
```

The `AppShell` is a client component that reads `useUser()`, redirects to `/auth` if unauthenticated, and renders the navbar + children.

### Metadata

Each route can export `metadata` (static) or `generateMetadata` (dynamic). The root layout sets defaults with a `template` so child routes append their title.

```tsx
export const metadata = {
  title: { default: 'My app', template: '%s, My app' },
  description: 'App description.',
  metadataBase: new URL('https://example.com'),
  openGraph: { type: 'website', siteName: 'My app' },
};
```

For auth-gated sections, disable indexing:

```tsx
export const metadata = {
  robots: { index: false, follow: false },
};
```

---

## Providers

### QueryProvider

TanStack Query client lives in a singleton module. The provider wraps the app in the root layout.

```ts
// lib/client/react-query.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      retry: 1,
      gcTime: 1000 * 60 * 60 * 24,
      refetchOnMount: true,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    },
  },
});
```

```tsx
// components/providers/query-provider.tsx
'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/client/react-query';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### DialogProvider

Imperative `Dialog` API backed by a React queue. See `.ai/skills/nextjs-agent-kit-dialogs/SKILL.md` for the full implementation. Mounted once in the root layout.

### Theme init

To prevent dark mode FOUC, inline a script in `<head>` that reads `localStorage` and sets the `.dark` class before hydration:

```ts
const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem('theme');
    var resolved = stored === 'light' || stored === 'dark'
      ? stored
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    var root = document.documentElement;
    if (resolved === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    root.style.colorScheme = resolved;
  } catch (e) {}
})();
`;
```

Inline it directly in `<head>` with `dangerouslySetInnerHTML`. Do not use `next/script` for this, it runs too late and causes a flash.

---

## State management

### TanStack Query: all server state

Every API response goes through React Query. Define hooks in `hooks/<resource>.hook.ts` with query key constants.

```ts
// hooks/wiki.hook.ts
import { useMutation, useQuery } from '@tanstack/react-query';
import { WikiApi } from '@/api/wiki-api';
import { queryClient } from '@/lib/client/react-query';

export const wikiTreeQueryKey = 'wiki-tree';
export const wikiDocumentQueryKey = 'wiki-document';

export const useWikiTree = () => {
  const { data, isLoading } = useQuery({
    queryKey: [wikiTreeQueryKey],
    queryFn: () => WikiApi.getTree(),
  });
  return { documents: data ?? [], isLoading };
};

export const useWikiDocument = (id: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: [wikiDocumentQueryKey, id, 'live'],
    queryFn: () => WikiApi.getDocument(id),
  });
  return { doc: data ?? null, isLoading, error };
};

export const useDeleteDocument = () => {
  return useMutation({
    mutationFn: (id: string) => WikiApi.deleteDocument(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: [wikiTreeQueryKey] });
      queryClient.invalidateQueries({ queryKey: [wikiDocumentQueryKey, id], exact: true });
    },
  });
};
```

### Query key rules

- `['resource']` for lists.
- `['resource', id]` for single items.
- `['resource', id, 'live']` or `['resource', id, 'deleted']` for variants.
- Export query key constants from the hook file so other hooks and mutations can reference them.

### Invalidation rules

- After create/update: invalidate the list key (prefix match, no `exact`).
- After delete: invalidate the list key, then invalidate the single-item key with `{ exact: true }` to prevent a refetch of the deleted resource.
- After a move (parent change): invalidate the old and new parent's children keys with `{ exact: true }`.

```ts
onSuccess: (data, { id }) => {
  const prevParentId = /* read from cache */;
  const nextParentId = data.parent_id ?? null;
  queryClient.setQueryData([wikiDocumentQueryKey, id, 'live'], data);
  queryClient.invalidateQueries({ queryKey: [wikiTreeQueryKey] });
  if (prevParentId !== nextParentId) {
    if (prevParentId) queryClient.invalidateQueries({ queryKey: [wikiChildrenQueryKey, prevParentId], exact: true });
    if (nextParentId) queryClient.invalidateQueries({ queryKey: [wikiChildrenQueryKey, nextParentId], exact: true });
  }
}
```

### Delete with navigation

When deleting a resource and navigating away, the component may keep rendering and trigger a refetch of the deleted resource (404). Prevent this:

1. Invalidate the single-item key with `{ exact: true }` in `onSuccess`.
2. Set an `isDeleting` flag before calling `router.push`, check it before rendering the not-found state.

### jotai: client-only UI state

Use jotai for ephemeral UI state that is not server data: overlay open/close, draft text, selected tab, in-memory filters.

```ts
import { atom, useAtom } from 'jotai';

const mobileMenuOpenAtom = atom(false);

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useAtom(mobileMenuOpenAtom);
  // ...
}
```

Never put API responses in jotai. If the data comes from the server, it goes in React Query.

---

## Proxy middleware

### `proxy.ts`

Next.js middleware (named `proxy.ts` in this kit to avoid confusion with route middleware) runs before every matched request. It handles:

- `www` to apex redirect (production)
- JWT authentication for protected `/api/*` routes
- Rate limiting for all `/api/*` routes
- Admin route protection

```ts
// proxy.ts
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

### JWT auth (Edge Runtime)

The middleware runs in the Edge Runtime, so it uses `jose` (not `jsonwebtoken`) for JWT verification.

```ts
// proxy/jwt-auth.ts
import * as jose from 'jose';
import { NextResponse, type NextRequest } from 'next/server';

export class JwtAuth {
  static async authenticate(request: NextRequest): Promise<JwtAuthResult> {
    const accessToken = this.extractAccessToken(request);
    if (!accessToken) {
      return { success: false, response: this.createErrorResponse('Unauthorized', 'token_not_found', 401) };
    }
    try {
      const { payload } = await jose.jwtVerify(accessToken, new TextEncoder().encode(Config.jwt.access_token_secret));
      return { success: true, userId: payload['x-user-id'] as string, email: payload['x-email'] as string, payload };
    } catch (error) {
      return { success: false, response: this.handleJwtError(error) };
    }
  }

  static createAuthenticatedResponse(request: NextRequest, userId: string, email: string | undefined, payload: jose.JWTPayload): NextResponse {
    const headers = new Headers(request.headers);
    headers.set('x-user-id', userId);
    headers.set('x-user-email', email || '');
    headers.set('x-jwt-payload', JSON.stringify(payload));
    return NextResponse.next({ request: { headers } });
  }

  static getFromHeaders(request: NextRequest): JwtPayload | null {
    const userId = request.headers.get('x-user-id');
    if (!userId) return null;
    return { user_id: userId, email: request.headers.get('x-user-email') || '', payload: {} };
  }

  static extractAccessToken(request: NextRequest): string | undefined {
    const authHeader = request.headers.get('authorization');
    return authHeader?.split(' ')[1] ?? request.cookies.get('access_token')?.value;
  }
}
```

The proxy verifies the JWT, then forwards `x-user-id`, `x-user-email`, `x-jwt-payload` as request headers to the route handler. Route handlers read these via `withAuth` or `JwtAuth.getFromHeaders`.

### Route wrappers

```ts
// middlewares/auth-wrapper.ts
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
export function withDB<T>(handler: RouteHandler<T>): RouteHandler<T> {
  return async (req, context) => {
    await connectDB();
    return handler(req, context);
  };
}
```

Compose them: `export const GET = withDB(withAuth(async (_req, { auth }) => { ... }));`

### Public route allowlist

The proxy maintains a list of public API prefixes that skip auth:

```ts
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
```

Any `/api/*` route not in this list requires a valid access token. Add new public routes here, not by removing the proxy from individual routes.

---

## Config

A static `Config` class reads all env vars at module load. Server-side only.

```ts
// lib/server/config.ts
import 'server-only';

export class Config {
  static readonly mongo = { uri: process.env.MONGODB_URI! };
  static readonly jwt = {
    access_token_secret: process.env.ACCESS_TOKEN_SECRET!,
    refresh_token_secret: process.env.REFRESH_TOKEN_SECRET!,
    access_token_expires_in: '1h',
    refresh_token_expires_in: '90d',
    cookie_access_token_max_age: 60 * 60,
    cookie_refresh_token_max_age: 60 * 60 * 24 * 90,
    issuer: process.env.DOMAIN,
    audience: process.env.DOMAIN,
  };
  static readonly app = {
    domain: process.env.DOMAIN!,
    env: process.env.ENV as 'development' | 'production',
    admin_user_id: process.env.ADMIN_USER_ID,
    allow_signup: process.env.ALLOW_SIGNUP !== 'false',
  };
}
```

Access via `Config.jwt.access_token_secret`, `Config.mongo.uri`, etc. Never read `process.env` directly in business logic, go through `Config` so the surface is auditable.

`NEXT_PUBLIC_*` vars are inlined at build time and are safe in client code. All other env vars are server-only.

---

## Server-only guard

Any module in `lib/server/` must start with `import 'server-only'`. This throws at build time if the module accidentally lands in the client bundle.

```ts
// lib/server/stores/wiki-store.ts
import 'server-only';
import { WikiDocumentSchema } from '@/schemas/wiki-document.schema';

export class WikiStore {
  constructor(private userId: string) {}
  // ...
}
```

Never import `lib/server/*` from a client component. If a client component needs the data, fetch it via an API route and React Query.