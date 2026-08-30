# Layouts, styling, and components

## App Router layouts

### Root layout

`app/layout.tsx` is the only place that mounts global providers, fonts, and the theme init script.

```tsx
import { QueryProvider } from '@/components/providers/query-provider';
import { DialogProvider } from '@/components/providers/dialog-provider';
import { Geist } from 'next/font/google';
import './globals.css';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="bg-background text-foreground min-h-screen antialiased">
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

Rules:

- `suppressHydrationWarning` on `<html>` because the theme script mutates the class before React hydrates.
- Inline the theme script in `<head>` with `dangerouslySetInnerHTML`. Do not use `next/script`, it runs too late and causes a dark mode flash.
- One `<Toaster />` (sonner) mounted in the root or app layout, not per page.

### Section layouts

Group auth-gated routes under a section layout that renders the app shell:

```tsx
// app/app/layout.tsx
import { AppShell } from './app-shell';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
```

```tsx
// app/app/app-shell.tsx
'use client';

import { Navbar } from '@/components/navbar';
import { useUser } from '@/hooks/user.hook';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUser();
  if (isLoading || !user) return null;
  return (
    <Navbar>
      {user && children}
    </Navbar>
  );
}
```

### Metadata

```tsx
export const metadata = {
  title: { default: 'My app', template: '%s, My app' },
  description: 'App description.',
  metadataBase: new URL('https://example.com'),
  openGraph: { type: 'website', siteName: 'My app' },
};
```

For auth-gated sections:

```tsx
export const metadata = { robots: { index: false, follow: false } };
```

For dynamic routes, use `generateMetadata`:

```tsx
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const doc = await getDocument(id);
  return { title: doc?.title ?? 'Untitled' };
}
```

---

## Styling

### Tailwind v4

`app/globals.css` imports Tailwind v4 and shadcn, defines the dark variant, and maps theme tokens:

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-sans);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-destructive: var(--destructive);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-popover: var(--popover);
  --color-card: var(--card);
}

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  /* ... rest of light tokens */
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  /* ... rest of dark tokens */
}

body {
  @apply bg-background text-foreground;
}
```

Rules:

- One `globals.css` in `app/`. No per-route CSS files.
- Use Tailwind utility classes in components. No inline `style` props unless the value is truly dynamic (computed at runtime).
- Dark mode via the `.dark` class on `<html>`, toggled by the theme init script and `next-themes` or a custom toggle.
- Define tokens in `:root` and `.dark`, map them in `@theme inline`.

### shadcn/ui

Config in `components.json`:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "base-nova",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/client/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

Add components with `npx shadcn@latest add button input label textarea ...`. They land in `components/ui/`.

Common base set:

```
button input label textarea checkbox select dialog alert-dialog dropdown-menu
popover sheet separator sonner skeleton scroll-area switch table tabs tooltip
command avatar badge accordion
```

### `cn` utility

```ts
// lib/client/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Icons

`lucide-react`. Import named icons per component:

```tsx
import { Plus, Search, Trash2 } from 'lucide-react';
```

---

## Components

### Server vs client

Default to server components. Add `'use client'` only when the component uses hooks, events, or browser APIs.

A common pattern: a server component fetches data, a client sub-component handles interaction:

```tsx
// app/wiki/[id]/page.tsx (server)
import { DocumentEditor } from '@/components/wiki/document-editor';
import { getDocument } from '@/lib/server/stores/wiki-store';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doc = await getDocument(id);
  if (!doc) return <NotFound />;
  return <DocumentEditor key={id} doc={doc} />;
}
```

```tsx
// components/wiki/document-editor.tsx (client)
'use client';
import { useState } from 'react';

export function DocumentEditor({ doc }: { doc: WikiDocumentDto }) {
  const [title, setTitle] = useState(doc.title);
  // ...
}
```

### State reset via `key`

When a component needs to reset its internal state on a prop change, pass a `key`:

```tsx
<DocumentEditor key={id} doc={doc} />
```

Do not use `useEffect` to sync state when the prop changes. The `key` prop unmounts and remounts the component with fresh initial state.

### Loading, error, empty, data states

Every data-driven component handles all four states explicitly:

```tsx
export function WikiHome() {
  const { homeData, isLoading, error } = useWikiHome();

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;
  if (!homeData || (homeData.roots.length === 0 && homeData.recentDocuments.length === 0)) {
    return <EmptyState />;
  }
  return <WikiList data={homeData} />;
}
```

---

## Dialogs and toasts

### Imperative `Dialog` API

The kit ships a `Dialog` object with `alert`, `confirm`, `prompt` methods that return promises. It is backed by a `DialogProvider` mounted in the root layout.

```ts
// lib/client/dialog.ts
type DialogHandlers = {
  alert: (options: DialogAlertOptions) => Promise<void>;
  confirm: (options: DialogConfirmOptions) => Promise<boolean>;
  prompt: (options: DialogPromptOptions) => Promise<string | null>;
};

let handlers: DialogHandlers | null = null;

export const bindDialogHandlers = (next: DialogHandlers | null) => {
  handlers = next;
};

export const Dialog = {
  async alert(options: DialogAlertOptions): Promise<void> {
    if (handlers) return handlers.alert(options);
    if (typeof window !== 'undefined') window.alert(toText(options));
  },
  async confirm(options: DialogConfirmOptions): Promise<boolean> {
    if (handlers) return handlers.confirm(options);
    if (typeof window !== 'undefined') return window.confirm(toText(options));
    return false;
  },
  async prompt(options: DialogPromptOptions): Promise<string | null> {
    if (handlers) return handlers.prompt(options);
    if (typeof window !== 'undefined') return window.prompt(toText(options));
    return null;
  },
};
```

The `DialogProvider` binds the handlers on mount and renders a queued modal. See `.ai/skills/nextjs-agent-kit-dialogs/SKILL.md` for the full provider implementation.

Usage from any client code:

```ts
import { Dialog } from '@/lib/client/dialog';

const confirmed = await Dialog.confirm({
  title: 'Delete document',
  description: 'This action cannot be undone.',
  confirmText: 'Delete',
  destructive: true,
});
if (!confirmed) return;
await deleteMutation.mutateAsync(id);
```

### `sonner` toasts

One `<Toaster />` mounted in the app layout:

```tsx
import { Toaster } from '@/components/ui/sonner';

<Toaster position="top-center" />
```

Trigger toasts with `toast`:

```ts
import { toast } from 'sonner';

toast.success('Document saved');
toast.error('Failed to save');
```

---

## Navigation

### `next/link` for client-side navigation

```tsx
import Link from 'next/link';

<Link href="/app/wiki">Wiki</Link>
<Link href={`/app/wiki/${doc._id}`}>{doc.title}</Link>
```

### `useRouter` for programmatic navigation

```tsx
import { useRouter } from 'next/navigation';

const router = useRouter();
router.push('/app/wiki');
router.back();
```

### `useSearchParams` for query params

```tsx
import { useSearchParams } from 'next/navigation';

const searchParams = useSearchParams();
const q = searchParams.get('q');
```

### `usePathname` for active state

```tsx
import { usePathname } from 'next/navigation';

const pathname = usePathname();
const isActive = pathname === '/app/wiki';
```

### Server redirects

In server components and route handlers:

```ts
import { redirect } from 'next/navigation';

if (!user) redirect('/auth');
```

---

## Text discipline

Text discipline (no em dashes, sentence case, sweep rule) lives in `.ai/shared/principles.md`. Examples:

| bad | good |
| --- | ---- |
| `Get Started Now` | `Get started now` |
| `Terms of Service` | `Terms of service` (proper noun exception: capitalize "Terms of Service" only if it is a legal document title that conventionally keeps capitals) |
| `Loading... Please Wait` | `Loading... please wait` |
| `Delete — this cannot be undone` | `Delete. This cannot be undone.` |
| `AI-powered wiki — built for teams` | `AI-powered wiki, built for teams` |