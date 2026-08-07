# Next.js 16.3.0

## summary

Bumped Next.js from 16.2.10 to 16.3.0. No app code changes. 16.3 is a
zero-breaking-change minor release: all improvements (lower dev memory, faster
builds via disk cache, faster SSR via native Node streams, fewer prefetch
requests, better static asset caching) apply with no code edits. Verified with a
clean production build (Turbopack), TypeScript pass, and all 11 routes
generated.

## files

- `package.json` - `next` `16.2.10` -> `16.3.0` (exact pin, matching prior
  convention and react/react-dom pins for reproducible Docker standalone builds).
- `package-lock.json` - synced, `next` resolved to 16.3.0 (7 packages changed).

## notes

- `next@latest` on npm is exactly 16.3.0 (canary is 16.3.1-canary.7). Installed
  `next@16.3.0` explicitly.
- `next.config.ts` unchanged (`output: "standalone"`). No 16.3 config keys
  needed.
- 16.3 opt-in features NOT enabled (left for a future change if wanted):
  - Instant Navigations: `cacheComponents: true` + `partialPrefetching: true`.
  - Experimental: Rust React Compiler (`experimental.turbopackRustReactCompiler`),
    network resilience (`experimental.useOffline`).
- 16.3 writes/maintains a version-matched `AGENTS.md` block pointing at bundled
  docs in node_modules when running `next dev`. No action required.
- Verified: `npm run build` -> "Next.js 16.3.0 (Turbopack)", compiled in 2.7s,
  TypeScript ok, 11/11 static pages generated, 0 vulnerabilities.

## usage

```bash
npm run build # standalone output for Docker
npm run dev   # http://localhost:3000
```
