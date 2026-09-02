# Next.js Agent Kit

A battle-tested Next.js project skeleton distilled from production apps. Opinionated, minimal, no boilerplate code shipped.

---

## Overview

This kit captures the architecture, conventions, and tooling shared across Next.js apps. It is intentionally generic: no domain-specific dependencies, no business logic, just the structure and the docs that describe it.

**Core principles**

- **Next.js 16 App Router**, React 19, TypeScript strict mode. No Pages Router.
- **TanStack Query** for all server state and API data fetching. Never store API responses in `useState`.
- **jotai** for client-only UI state (overlays, drafts, ephemeral flags). Server state stays in React Query.
- **MongoDB with Mongoose**. Interfaces in `model/`, schemas in `schemas/`. Snake_case field names.
- **JWT in httpOnly cookies**. Access token 1h, refresh token 90d, rotation, encrypted at rest. No `localStorage` tokens.
- **`proxy.ts` middleware** for auth and rate limiting. `jose` for Edge Runtime. Route handlers stay thin, delegate to controllers.
- **Controllers as static classes**. Route handlers delegate to `controllers/*.controller.ts`. No fat routes.
- **`server-only` import guard** on server modules that must never reach the client bundle.
- **shadcn/ui + Tailwind v4**. Base-nova style, neutral base color, lucide-react icons.
- **Luxon** for dates. `DateTime.fromISO()`, default zone `Europe/Rome`.
- **No inline ternaries**. Always if/else. No `// eslint-disable` comments. No em dashes in UI strings.
- **Docker Compose dev**. MongoDB + node:24-alpine via `dev.sh`. `npm.sh` wrapper for containerized npm.
- **Standalone Dockerfile** with `output: 'standalone'`. k3s deploy manifest and script (GCP Cloud Run, Vercel, Fly.io also compatible).

---

## Directory structure

```
app/
  layout.tsx                # Root layout: fonts, metadata, QueryProvider, DialogProvider, theme init
  globals.css               # Tailwind v4 imports, @theme inline tokens, dark variant
  page.tsx                  # Landing page (server component)
  <route>/                  # Route segments (page.tsx, layout.tsx, loading.tsx)
    [id]/                   # Dynamic segments
    page.tsx                # Route component (server by default, 'use client' when needed)
  api/                      # Route handlers
    <resource>/
      route.ts              # Thin handler, delegates to controller
      [id]/
        route.ts
proxy.ts                    # Middleware: JWT auth, rate limit, public route allowlist, www redirect
next.config.ts              # output: 'standalone', file tracing root
tsconfig.json               # strict, @/* path alias
eslint.config.mjs           # Next.js core-web-vitals + TS presets
components.json             # shadcn/ui config (base-nova, neutral)
api/                        # Client-side API classes (browser fetch)
  <resource>-api.ts         # static class methods calling client.fetch
hooks/                      # React Query hooks
  <resource>.hook.ts        # useQuery + useMutation + query key constants
  ui/                       # UI-only hooks (use-theme, use-auto-save, etc.)
model/                      # TypeScript interfaces (backend + DTOs)
  <entity>.ts               # Entity interface + DTO interface
schemas/                    # Mongoose schemas
  <entity>.schema.ts        # new Schema<Interface>(), indexes, model registration
controllers/                # Server-side static controller classes
  <resource>.controller.ts  # handle*Request + business logic, returns NextResponse
lib/
  client/                   # Browser-only utilities (cn, sanitize, path helpers)
  server/                   # Server-only utilities (stores, AI clients, MCP clients)
    stores/                 # Per-user data access classes (WikiStore, etc.)
  shared/                   # Isomorphic utilities (format-date, types, link helpers)
components/
  ui/                       # shadcn/ui primitives (button, dialog, select, etc.)
  <feature>/                # Feature components
public/                     # Static assets, icons, og images
content/                    # Markdown/MDX content (if any)
dev.sh                      # Docker Compose dev wrapper
docker-compose.local.yml    # MongoDB + node:24-alpine
Dockerfile                  # Multi-stage standalone build
npm.sh                      # Containerized npm wrapper (optional)
.dockerignore               # Excludes env, deploy, dev files from the image
deploy.yaml                 # k3s manifest (if k3s deploy target)
deploy-k3s.sh               # k3s build + push + rollout (if k3s deploy target)
deploy.sh                   # GCP Cloud Run deploy script (if Cloud Run target)
.env.local                  # Development env (gitignored)
.env.production             # Production env (gitignored)
changes/                    # Chronological change log (read-only by convention)
```

### Subfolder rules

| folder         | required | contents                                                              |
| -------------- | -------- | -------------------------------------------------------------------- |
| `app/`         | always   | App Router routes, layouts, route handlers                            |
| `api/`         | if I/O   | Client API classes, static methods, use `client.fetch`               |
| `hooks/`       | if I/O   | React Query hooks, query key constants, `useQuery`/`useMutation`     |
| `model/`       | if data  | TypeScript interfaces, backend shape + DTO shape                     |
| `schemas/`     | if data  | Mongoose schemas, indexes, model registration                        |
| `controllers/` | if I/O   | Static controller classes, business logic, return `NextResponse`     |
| `components/`  | always   | React components, shadcn/ui in `ui/`, feature components grouped     |
| `lib/`         | always   | `client/`, `server/`, `shared/` utilities                            |

Not every feature needs all folders. A static page only needs `app/<route>/page.tsx`. A feature with no persistence skips `model/` and `schemas/`. Start minimal, add folders as the feature grows.

### `lib/` split

- `lib/client/`: browser-only utilities. Safe to import from client components.
- `lib/server/`: server-only utilities. Always import `'server-only'` at the top. Never import from client components.
- `lib/shared/`: isomorphic utilities (pure functions, no server or browser APIs). Safe to import from anywhere.

---

## What to avoid

| anti-pattern                                       | reason                                                               | do instead                                                                                     |
| -------------------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Pages Router                                       | Legacy, no RSC, no streaming, no layout nesting                      | App Router                                                                                     |
| `useState` for API responses                       | Manual lifecycle, no caching, no invalidation, no background refetch | TanStack Query `useQuery` + `useMutation`                                                      |
| `useEffect` for initial state                      | Tangled lifecycle, hydration mismatches                              | `useState` initialized directly, or sub-component with `key` prop for reset                    |
| `localStorage` for auth tokens                     | XSS exposure, no httpOnly, no automatic send                         | httpOnly cookies via `setCookies`/`clearCookies`                                               |
| Fat route handlers                                 | Mixed concerns, untestable, duplicated logic                         | Thin route handler delegates to `controllers/*.controller.ts`                                  |
| Mongoose schemas inline in models                  | Mixing types and runtime config, harder to reuse                     | `model/` interfaces, `schemas/` Mongoose schemas                                               |
| camelCase DB fields                                | Inconsistent with backend conventions, breaks sorting                | snake_case field names (`user_id`, `created_at`)                                               |
| Returning ObjectId to the client                   | JSON serialization breaks, frontend expects strings                  | Convert to string in DTO: `_id: user._id.toString()`                                           |
| `fetch` without the kit `client`                   | No 401 refresh, no dedupe, no error dialog                           | `client.fetch` from `client/client.ts` for browser, server `fetch` directly for server modules  |
| Inline ternary operators                           | Hard to read, nested conditionals                                    | if/else blocks, extract to methods                                                             |
| `// eslint-disable-next-line`                      | Masks real issues                                                    | Fix the underlying lint warning                                                                |
| Barrel files (`index.ts` re-exports)               | Indirect, harder to trace imports                                    | Direct imports unless 5+ files to re-export                                                    |
| Relative imports for cross-feature                | Brittle to folder moves, deep paths                                   | `@/*` absolute imports                                                                         |
| `Date` for storage                                 | Timezone ambiguity, parsing drift                                     | Luxon `DateTime`, store as ISO 8601 UTC string, parse with `DateTime.fromISO()`                |
| Em dashes in UI strings                            | Poor readability, inconsistent typography                             | Commas, periods, or restructure                                                                |
| Title case for UI labels                           | Inconsistent, shouted visual weight                                   | Sentence case, only proper nouns capitalized                                                   |
| Fabricated content (quotes, testimonials, reviews) | Dishonest, invented data                                             | Real data only, cite verbatim                                                                  |
| Calling `res.json()` from a server service         | Couples service to HTTP, untestable                                   | Service returns typed data, controller builds `NextResponse`                                   |
| Direct pushes to `main` / skipping lint            | Bypasses review, lets lint errors land on deployable branch           | PR-based squash-merge, run `npm run lint` + `tsc --noEmit` first (see `.ai/shared/git.md`)             |
| Global singletons for DB connections               | Serverless cold start issues, connection leaks                       | `connectDB()` cached singleton via `globalThis` (see `.ai/data.md`)                            |
| `next/script` for critical theme init              | FOUC on dark mode load                                               | Inline `<script strategy="beforeInteractive">` in `<head>` (see `.ai/ui.md`)                   |

---

## Quick-start checklist

When scaffolding a new project from this kit:

- [ ] `npx shadcn@latest init --template next`
- [ ] Copy `agents/` folder into the project
- [ ] Configure `tsconfig.json` with `@/*` path alias and `strict: true`
- [ ] Configure `eslint.config.mjs` extending Next.js core-web-vitals + TS
- [ ] Configure `next.config.ts` with `output: 'standalone'` and `outputFileTracingRoot`
- [ ] Configure `components.json` for shadcn/ui (base-nova, neutral)
- [ ] Set up `app/globals.css` with Tailwind v4 imports and `@theme inline` tokens
- [ ] Add `QueryProvider` and `DialogProvider` to `app/layout.tsx` (scaffold ships a minimal layout with theme init and metadata; add providers when the first feature needs them)
- [ ] Create `proxy.ts` middleware with JWT auth, rate limit, public route allowlist
- [ ] Install base dependencies (see `.ai/setup.md`)
- [ ] Add shadcn/ui components (see `.ai/setup.md`)
- [ ] Create `dev.sh` + `docker-compose.local.yml` for local dev
- [ ] Create `Dockerfile` for production standalone build
- [ ] Create `.dockerignore` to exclude env/deploy files from the image
- [ ] Pick a deploy target and create the matching deploy files (k3s: `deploy.yaml` + `deploy-k3s.sh`, Cloud Run: `deploy.sh`, Vercel: none, see `.ai/setup.md`)
- [ ] Create `.env.local` (gitignored) and `.env.example` (committed reference)
- [ ] Create `changes/` folder
- [ ] Create `model/user.ts` + `schemas/user.schema.ts` (see `.ai/skills/nextjs-agent-kit-auth/SKILL.md`)
- [ ] Run `npm run lint && npx tsc --noEmit` to verify

---

## AI agent guide

This document is the source of truth for the project architecture and conventions. Read it before implementing any feature.

### On-demand file index

This file is always loaded. The files below are loaded on demand based on the task. Read the file that matches your work.

| task                                  | read                        |
| ------------------------------------- | --------------------------- |
| App Router, server/client split, providers | `.ai/architecture.md`  |
| Writing a model or schema             | `.ai/data.md`               |
| Writing a route handler or controller | `.ai/services.md`           |
| Writing a layout or component, styling | `.ai/ui.md`                |
| Scaffolding, env config, Docker, deploy | `.ai/setup.md`            |
| Naming or import questions            | `.ai/conventions.md`        |
| Code style questions (ternaries, barrel files, lint suppression, file size) | `.ai/shared/code-style.md` |
| Operating principles, text discipline | `.ai/shared/principles.md`  |
| Git workflow, branches, commits       | `.ai/shared/git.md`         |
| Change tracking, checklist            | `.ai/shared/process.md`     |

### Skills

This project ships Agent Skills (agentskills.io format) in `.ai/skills/`. Compatible tools (Claude Code, Cursor, Gemini CLI, opencode, GitHub Copilot, VS Code, Amp, and 40+ others) auto-discover them by trigger keywords. For tools without skill support, read the matching `SKILL.md` directly when the task fits.

| skill | use when |
|---|---|
| `nextjs-agent-kit-auth` | auth, login, signup, token refresh, 401 handling, session expiry, Google OAuth, Apple mobile auth, password reset |
| `nextjs-agent-kit-ai-chat` | AI chat, OpenAI-compatible endpoint, SSE streaming, tool calling, conversation persistence |
| `nextjs-agent-kit-payments` | payments, subscriptions, Stripe, Paddle, Dodo Payments, checkout, webhooks, entitlement gating |
| `nextjs-agent-kit-notifications` | push notifications, FCM, Firebase messaging, token sync, in-app notifications |
| `nextjs-agent-kit-email` | email, transactional email, Plunk, MailerSend, Brevo, SMTP, OTP, password reset email |
| `nextjs-agent-kit-storage` | file storage, Google Cloud Storage, uploads, attachments, file validation, magic bytes |
| `nextjs-agent-kit-dialogs` | dialogs, toasts, sonner, confirmation prompts, session-expired banners, imperative Dialog API |
| `nextjs-agent-kit-settings` | settings screen, LLM provider config, clear app data, timezone auto-detect, feedback, about |
| `nextjs-agent-kit-landing` | landing page, hero, features, pricing, FAQ, CTA, marketing sections, JSON-LD, sitemap, testimonials |
| `nextjs-agent-kit-telegram` | telegram, bot, sendMessage, admin notifications, waitlist or contact form, install event, feedback |

Each skill folder contains a `SKILL.md` (workflow overview, under 500 lines) plus a `references/` directory with detailed code examples. The agent loads `SKILL.md` first, then reads reference files on demand.

### Before you start

Read these sections in order:

1. **Directory structure** above, understand where files go
2. `.ai/architecture.md`, understand the App Router + providers + proxy pattern
3. `.ai/data.md`, understand Mongoose models and schemas
4. `.ai/conventions.md`, understand file and class naming
5. **What to avoid** above, understand the constraints

### Operating principles

Shared behavioral rules live in `.ai/shared/principles.md` (interaction, honesty, safety, text discipline). Read it before implementing any feature.

### Feature implementation workflow

When asked to implement a new feature, follow these steps in order.

#### 1. Read existing code first

```
app/                                 # check existing routes and layouts
api/                                 # check existing client API classes
hooks/                               # check existing React Query hooks
model/  schemas/                     # check existing models and schemas
controllers/                         # check existing controllers
components/                          # check existing components
.ai/skills/nextjs-agent-kit-<feature>/SKILL.md  # read the skill for the feature type
```

If a skill matches the feature type (auth, ai_chat, payments, notifications, email, storage, dialogs, settings, landing, telegram), read it. If none matches, follow the generic steps below.

#### 2. Create the feature folders

Only create the folders the feature needs. A minimal feature may only need `app/<route>/page.tsx` and `components/<feature>/`. A data feature adds `model/`, `schemas/`, `api/`, `hooks/`, `controllers/`.

#### 3. Write the types and model(s)

File: `model/<entity>.ts`

Follow `.ai/data.md` exactly: backend interface with `Types.ObjectId` for references, DTO interface with `string` for IDs and ISO strings for dates.

#### 4. Write the schema

File: `schemas/<entity>.schema.ts`

Follow `.ai/data.md`: `new Schema<Interface>()`, snake_case fields, indexes, `models.X || model<X>()` registration.

#### 5. Write the controller

File: `controllers/<resource>.controller.ts`

Follow `.ai/services.md`: static class, `handle*Request` methods returning `NextResponse`, business logic in typed methods returning `AuthResult<T>` or plain data.

#### 6. Write the route handler(s)

File: `app/api/<resource>/route.ts` and `app/api/<resource>/[id]/route.ts`

Follow `.ai/services.md`: thin handlers, `withDB(withAuth(async (...) => { ... }))`, delegate to the controller.

#### 7. Write the API client and hook

Files: `api/<resource>-api.ts` and `hooks/<resource>.hook.ts`

Follow `.ai/services.md`: static class methods calling `client.fetch`, typed responses. React Query hooks with query key constants, `useQuery` for reads, `useMutation` for writes with `onSuccess` invalidation.

#### 8. Write the components and route

Files: `components/<feature>/*.tsx` and `app/<route>/page.tsx`

Follow `.ai/ui.md`: server component by default, `'use client'` only when needed (hooks, events, browser APIs). Use shadcn/ui primitives, Tailwind v4 classes, lucide-react icons. Handle loading, error, empty, and data states explicitly.

#### 9. Verify

```bash
npm run lint
npx tsc --noEmit
```

Fix all reported errors before finishing. Do not use `// eslint-disable-next-line` comments.

#### 10. Record the change

Create `changes/YYYY-MM-DD_HH-MM_<slug>/README.md` per `.ai/shared/process.md`.

### Critical rules

These rules must never be violated. If unsure, read the referenced file.

| rule                                                                                                  | reference                                   |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| App Router, no Pages Router                                                                           | `.ai/architecture.md`                       |
| TanStack Query for all server state, never `useState` for API responses                               | `.ai/architecture.md`                       |
| jotai for client-only UI state only                                                                   | `.ai/architecture.md`                       |
| `model/` interfaces, `schemas/` Mongoose schemas, never inline                                         | `.ai/data.md`                               |
| DB field names: snake_case (`user_id`, `created_at`)                                                  | `.ai/data.md`                               |
| ObjectId on backend, string on frontend DTOs                                                          | `.ai/data.md`                               |
| Luxon `DateTime`, ISO 8601 UTC for storage, `DateTime.fromISO()` for parsing                          | `.ai/data.md`                               |
| `connectDB()` cached singleton via `globalThis`, never module-level `late`                            | `.ai/data.md`                               |
| JWT in httpOnly cookies, never `localStorage`                                                         | `.ai/skills/nextjs-agent-kit-auth/SKILL.md` |
| `proxy.ts` middleware with `jose` for Edge Runtime, `withDB` + `withAuth` wrappers                    | `.ai/architecture.md`, `.ai/services.md`    |
| Route handlers thin, delegate to `controllers/*.controller.ts`                                        | `.ai/services.md`                           |
| `server-only` import guard on server modules                                                          | `.ai/services.md`                           |
| Browser fetch via `client.fetch` (401 refresh, dedupe), server fetch directly                         | `.ai/services.md`                           |
| Query keys: `['resource']` for lists, `['resource', id]` for single items                             | `.ai/architecture.md`                       |
| Invalidate with `{ exact: true }` after delete to prevent prefix-match refetch                        | `.ai/architecture.md`                       |
| shadcn/ui + Tailwind v4, no custom CSS framework                                                      | `.ai/ui.md`                                 |
| Theme init script in `<head>` with `strategy="beforeInteractive"` to prevent FOUC                     | `.ai/ui.md`                                 |
| `@/*` absolute imports for intra-project, no relative imports for cross-feature                       | `.ai/conventions.md`                        |
| No inline ternary operators, always if/else                                                           | `.ai/shared/code-style.md`                  |
| No `// eslint-disable-next-line` comments                                                             | `.ai/shared/code-style.md`                  |
| No em dashes in UI strings, use commas or periods                                                     | `.ai/ui.md`                                 |
| Sentence case for UI labels and headings, no title case                                               | `.ai/ui.md`                                 |
| File names: kebab-case routes, PascalCase components                                                  | `.ai/conventions.md`                        |
| Max ~400 lines per file (excludes comments, blank lines, imports)                                     | `.ai/conventions.md`                        |
| Run `npm run lint` + `tsc --noEmit` before opening a PR                                               | `.ai/shared/git.md`                         |
| Commit the `changes/` entry in the same PR as the feature                                             | `.ai/shared/process.md`                     |
| Never edit previous `changes/` folders                                                                | `.ai/shared/process.md`                     |

### Common mistakes to avoid

1. **Storing API responses in `useState`**. Use TanStack Query `useQuery`. The `QueryProvider` is in the root layout.
2. **Using `useEffect` for initial state**. Use `useState` directly, or split into a sub-component with a `key` prop for reset.
3. **Returning `ObjectId` to the client**. Always convert to string in the DTO: `_id: user._id.toString()`.
4. **camelCase DB fields**. Use snake_case: `user_id`, `created_at`, `updated_at`, `deleted_at`.
5. **Fat route handlers**. Delegate to `controllers/*.controller.ts`. The route handler only wires `withDB` + `withAuth` and calls the controller.
6. **Calling `res.json()` inside a service**. Services return typed data. Controllers build `NextResponse`.
7. **Using `fetch` directly in client code**. Use `client.fetch` from `client/client.ts` for 401 refresh, dedupe, and error dialog.
8. **Forgetting `server-only`**. Any `lib/server/*` module must `import 'server-only'` to prevent leaking into the client bundle.
9. **Using `Date` for storage**. Use Luxon `DateTime`, store as ISO 8601 UTC, parse with `DateTime.fromISO()`.
10. **Inline ternaries**. Use if/else. ESLint may not catch them, but the kit bans them.
11. **`// eslint-disable-next-line`**. Fix the underlying issue.
12. **Barrel files**. Import files directly. Only use barrel files for 5+ modules.
13. **Relative imports for cross-feature**. Use `@/*` absolute imports.
14. **Forgetting to invalidate queries after mutations**. Use `queryClient.invalidateQueries({ queryKey: [...] })` in `onSuccess`. Use `{ exact: true }` after delete.
15. **Skipping the `changes/` folder**. Every change gets a `changes/YYYY-MM-DD_HH-MM_slug/README.md` entry.
16. **Putting theme init in `next/script`**. Inline it in `<head>` with `strategy="beforeInteractive"` to avoid FOUC.
17. **Creating a global `late` DB connection**. Use `connectDB()` cached via `globalThis` for serverless safety.
18. **Bypassing `proxy.ts`**. All `/api/*` routes go through the proxy. Public routes must be in `PUBLIC_API_PREFIXES`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
