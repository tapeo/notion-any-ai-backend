# Plan: Any AI for Notion landing page

## TL;DR

Build a marketing landing page for the "Any AI for Notion" mobile app inside the existing pure-backend Next.js 16 repo, following the nextjs-agent-kit-landing skill conventions. The repo currently has zero frontend stack (no Tailwind, no shadcn, no layout, no page, no CSS), so Phase 1 brings it up to the kit baseline. Then we add the chrome (Nav/Footer/Container), the chosen sections (Hero, ProductPreview, Features, TrustStrip, Comparison, Pricing, FAQ, CTA), typed data files, JSON-LD, and SEO files. Single lifetime pricing tier ($99, was $199). No waitlist, no social-proof sections requiring real quotes/metrics (none available yet).

## Context

- **Product:** "Any AI for Notion" — mobile app that uses AI to interact with a Notion workspace. This repo is its backend (Notion OAuth + Notion API proxy). App deep-links via `notionopenai://` scheme.
- **Stack:** Next.js 16.2.10 App Router, React 19, TS 5, `output: "standalone"`, deploys to GCP Cloud Run via `deploy.sh`. Path alias `@/*` → `./*` already set.
- **Current state:** Pure API. No `app/page.tsx`, no `app/layout.tsx`, no CSS, no components, no UI deps. `public/` has only default Next.js SVGs. API routes live under `/api/*` so a root `/` page won't conflict. Route handlers bypass layouts, so the OAuth callback inline HTML is unaffected.
- **Skill source:** `/Users/matteo/projects/agent-toolkit/nextjs-agent-toolkit/skills/nextjs-agent-kit-landing/` (SKILL.md + 28 reference files). Conventions: one section per file in `components/landing/`, PascalCase named export, no props on top-level sections, shared data in `content/landing/*.ts`, co-located section-only data as SCREAMING_SNAKE consts, one-off prose hardcoded in JSX. No new animation libs (use `tw-animate-css` + CSS transitions).

## Decisions

- **Setup:** Full kit stack — Tailwind v4, shadcn (base-nova, neutral), lucide-react, tw-animate-css, `cn()` util, globals.css, root layout. Matches the skill exactly.
- **Sections included:** Nav, Footer (chrome) + Hero, ProductPreview, Features, TrustStrip, Comparison, Pricing, FAQ, CTA.
- **Sections excluded:** HowItWorks, AppShowcase, Waitlist, Testimonials, Metrics, ScreenshotGallery, UseCases, ContextLayer, Skills, ProblemSolution, PullQuote, Bio, Provenance, SectionTracker. (No real proof assets; no waitlist flow.)
- **Pricing:** Single lifetime tier, $99 one-time (discounted from $199). Pricing section + SoftwareApplication JSON-LD with offer price "99" USD. No waitlist form, so no `/api/waitlist` route or storage needed.
- **Domain:** User entered `nextjsagentkit.com` — **this looks like a placeholder; needs confirmation** (product is "Any AI for Notion"). Plan uses it as-is for metadata/sitemap/robots but flag for review.
- **Real proof:** None yet. TrustStrip will list supported AI agents/models (needs the real list from the user). Comparison will be factual vs alternatives (needs confirmation of which alternatives). All other copy is placeholder to be refined.

## Content gaps (need user input, not implementation blockers)

1. **Domain** — confirm `nextjsagentkit.com` vs actual product domain.
2. **ProductPreview asset** — Vimeo demo video ID or app screenshot (`.webp` in `public/`). None available yet; use placeholder.
3. **TrustStrip list** — which AI agents/models "Any AI for Notion" supports (the "any AI" value prop). Need real names.
4. **Comparison alternatives** — which competitors/alternatives to compare against (e.g., Notion AI built-in, manual Notion use). Need confirmation.
5. **FAQ content** — real Q&A pairs.
6. **Pricing tier features** — the feature list for the $99 lifetime tier.
7. **Features list** — the product capabilities to showcase with lucide icons.
8. **Hero copy** — eyebrow, headline, subheading, CTA labels/links (App Store / Play Store / OAuth start?).

## Steps

### Phase 1: Foundation (kit stack setup) — blocks all later phases

1. Install Tailwind v4 + PostCSS plugin (`@tailwindcss/postcss`), `tailwindcss`. Create `postcss.config.mjs` with the postcss plugin. *(No `tailwind.config.ts` — v4 uses CSS-first config via `@theme`.)*
2. Install `lucide-react`, `tw-animate-css`, `clsx`, `tailwind-merge`.
3. Run `npx shadcn@latest init` with style `base-nova`, base color `neutral`, icon library `lucide`, RSC on, TSX, CSS variables. This creates `components.json` and `lib/client/utils.ts` (`cn()`). If shadcn init places `utils.ts` elsewhere, ensure `cn()` is importable as `@/lib/client/utils`.
4. Create `app/globals.css`: `@import "tailwindcss"`, `@import "tw-animate-css"`, `@import "shadcn/tailwind.css"`, `@custom-variant dark`, `@theme inline` token mapping (oklch), `:root` and `.dark` token blocks, plus `html { scroll-padding-top: 4rem; scroll-behavior: smooth; }`.
5. Create `app/layout.tsx`: root layout with font imports, `<html>` with `.dark` class support, inline theme-init script in `<head>` (NOT `next/script`, avoids FOUC), `<body>`, metadata `title` template (`{ default: 'Any AI for Notion', template: '%s · Any AI for Notion' }`), `metadataBase`. Import `globals.css`.
6. Add shadcn primitives: `npx shadcn@latest add card accordion button badge`. (Skip `input` — no waitlist.) These land in `components/ui/`.

### Phase 2: Chrome + data layer — *parallel after Phase 1*

7. Create `components/landing/container.tsx` exporting `Container` — max-width wrapper `mx-auto max-w-[1200px] px-6 sm:px-8`, appends `className` (not `cn()`-merged). Used by every section. *All sections depend on this.*
8. Create `components/landing/nav.tsx` exporting `Nav` (client component) — fixed top bar `fixed inset-x-0 top-0 z-50 bg-background/80 backdrop-blur`, anchor links via plain `<a href="#id">`, mobile hamburger with `useState`, lucide `Menu` icon. *parallel with step 9, 10, 11*
9. Create `components/landing/footer.tsx` exporting `Footer` — re-declares `max-w-[1200px] px-6 sm:px-8` (standalone chrome exception), co-located `FOOTER_LINKS`. *parallel with step 8, 10, 11*
10. Create `content/landing/faqs.ts` — `export type Faq`, `export const FAQS: Faq[]`. Shared by FAQ section + FAQPage JSON-LD. *parallel*
11. Create `content/landing/pricing.ts` — `export type Tier`, `export const TIERS: Tier[]` with single lifetime tier (`id: "lifetime"`, `name: "Lifetime"`, `price: "$99"`, `cadence: "one-time"`, `highlight: true`, `features[]`, `cta`). Shared by Pricing section + SoftwareApplication JSON-LD. *parallel*

### Phase 3: Sections — *parallel after Phase 1 + step 7 (Container)*

12. Create `components/landing/hero.tsx` exporting `Hero` (server) — eyebrow, headline, subheading, two CTAs. Left-aligned variant (`md:grid-cols-2`) with ProductPreview on right, or centered. One-off prose hardcoded. *parallel with 13-19*
13. Create `components/landing/product-preview.tsx` exporting `ProductPreview` (server) — placeholder for now: either Vimeo iframe (`aspect-video`, `VIMEO_ID` const) or `next/image` screenshot. Needs real asset (see content gaps). *parallel*
14. Create `components/landing/features.tsx` exporting `Features` (server) — shadcn `Card` grid, lucide icons typed as `LucideIcon`, co-located `FEATURES` array (`{ icon, title, description }`), responsive `1/2/3` cols. *parallel*
15. Create `components/landing/trust-strip.tsx` exporting `TrustStrip` (server) — `flex-wrap justify-center gap-x-10`, plain text wordmarks of supported AI agents, co-located `AGENTS` array. Needs real agent list (see content gaps). *parallel*
16. Create `components/landing/comparison.tsx` exporting `Comparison` (server) — shadcn `Card`, `Check`/`X` lucide icons, `Row` type with `you: boolean; alt: boolean`, co-located `ROWS`/`ALTERNATIVES`. Factual, no disparaging. Needs alternative names (see content gaps). *parallel*
17. Create `components/landing/pricing.tsx` exporting `Pricing` (server) — reads `TIERS` from `content/landing/pricing.ts`, `TierCard` sub-component takes `tier: Tier` prop (the documented exception), highlighted tier gets `border-primary` + `Badge` "Popular"/"Lifetime", `Button asChild` wraps `Link`. Show "$99" with "was $199" strikethrough (customization beyond skill's default price+cadence). *parallel*
18. Create `components/landing/faq.tsx` exporting `Faq` (server) — shadcn `Accordion` from `FAQS` (`content/landing/faqs.ts`), `max-w-3xl`. *parallel*
19. Create `components/landing/cta.tsx` exporting `CTA` (server) — `bg-primary/5 border-y` band, `Button asChild size="lg"` wrapping `Link`. One headline, one button. One-off prose. *parallel*

### Phase 4: Page assembly + SEO — *depends on all sections + data*

20. Create `app/page.tsx` (server component):
    - Build JSON-LD: `FAQPage` from `FAQS`, `SoftwareApplication` from `TIERS` (strip non-numeric from `price` → "99", `priceCurrency: "USD"`, single `Offer`).
    - Inject JSON-LD as `<script type="application/ld+json" dangerouslySetInnerHTML>` at top, before `<Nav />`.
    - Render `<Nav />`, `<main className="pt-16">` stacking sections in reading order: Hero → ProductPreview → Features → TrustStrip → Comparison → Pricing → FAQ → CTA, then `<Footer />`.
    - Export `metadata`: `title`, `description`, `metadataBase`, `openGraph` (`type: 'website'`), `twitter` (`card: 'summary_large_image'`).
21. Create `app/sitemap.ts` — `MetadataRoute.Sitemap` with `/` route, `lastModified: new Date()`, `changeFrequency: 'weekly'`, `priority: 1`. Add more routes as built.
22. Create `app/robots.ts` — `disallow: ['/api']` (no `/app` auth-gated route exists in this repo; keep API out of index), `sitemap` URL.
23. (Optional) Create `app/opengraph-image.tsx` — `next/og` `ImageResponse`, `runtime = 'edge'`, `size = { 1200, 630 }`. Skip if no brand design ready.

### Phase 5: Cleanup + verification

24. Remove default Next.js SVGs from `public/` (`next.svg`, `vercel.svg`, `file.svg`, `globe.svg`, `window.svg`) if unused. Add a favicon (`app/favicon.ico` or `app/icon.tsx`).
25. Verify `Dockerfile` still copies `public/` and `.next/static` correctly (it does — no change needed, but confirm standalone build includes the new pages).
26. Run `npm run build` — confirm no type errors, no build failures, standalone output includes `app/page.tsx`.
27. Run `npm run dev` — visit `/`, confirm landing renders, nav anchor links scroll with offset, dark mode toggles, mobile menu works.
28. Confirm `/api/*` routes still respond (health, oauth) — layouts don't affect route handlers, but verify no regression.

## Relevant files

- `package.json` — add deps: tailwind v4, @tailwindcss/postcss, lucide-react, tw-animate-css, clsx, tailwind-merge, shadcn primitives.
- `postcss.config.mjs` — new, Tailwind v4 postcss plugin.
- `app/globals.css` — new, Tailwind imports + @theme tokens + scroll-padding-top.
- `app/layout.tsx` — new, root layout, fonts, metadata template, theme init script.
- `app/page.tsx` — new, landing page server component, JSON-LD, section composition.
- `app/sitemap.ts` — new, sitemap route.
- `app/robots.ts` — new, robots route.
- `app/opengraph-image.tsx` — new (optional), dynamic OG image.
- `lib/client/utils.ts` — new (via shadcn init), `cn()` (clsx + tailwind-merge).
- `components.json` — new (via shadcn init), base-nova config.
- `components/ui/` — new, shadcn primitives (card, accordion, button, badge).
- `components/landing/container.tsx` — `Container` wrapper.
- `components/landing/nav.tsx` — `Nav` (client).
- `components/landing/footer.tsx` — `Footer`.
- `components/landing/hero.tsx` — `Hero`.
- `components/landing/product-preview.tsx` — `ProductPreview`.
- `components/landing/features.tsx` — `Features`.
- `components/landing/trust-strip.tsx` — `TrustStrip`.
- `components/landing/comparison.tsx` — `Comparison`.
- `components/landing/pricing.tsx` — `Pricing` + `TierCard`.
- `components/landing/faq.tsx` — `Faq`.
- `components/landing/cta.tsx` — `CTA`.
- `content/landing/faqs.ts` — `Faq` type, `FAQS` array.
- `content/landing/pricing.ts` — `Tier` type, `TIERS` array.
- `public/` — remove default SVGs, add favicon + product assets (screenshot/logo) when available.
- `Dockerfile` — no change expected (confirm standalone build).
- `deploy.sh` — no change (new files picked up by `git archive`).

## Verification

1. `npm run build` passes with no type errors; `.next/standalone` includes `app/page.tsx` and `app/layout.tsx`.
2. `npm run dev`, open `http://localhost:3000` — landing page renders all 8 sections in order.
3. Nav anchor links (`#features`, `#pricing`, `#faq`) scroll to sections clearing the fixed nav (scroll-padding-top works).
4. Dark mode toggle works (`.dark` class on `<html>`, no FOUC on reload).
5. Mobile menu opens/closes (hamburger).
6. Pricing card shows "$99" with "was $199" and "Lifetime" badge, CTA button links correctly.
7. FAQ accordion expands/collapses.
8. View page source — JSON-LD scripts present (FAQPage + SoftwareApplication), valid at https://validator.schema.org.
9. `/api/health` returns `{ "status": "ok" }` — no regression to API routes.
10. `/api/notion-oauth/start` still returns authorization URL — no regression.
11. `curl /sitemap.xml` returns sitemap; `curl /robots.txt` returns robots with `Disallow: /api`.
12. `docker build` succeeds and `docker run` serves the landing page on port 3000.

## Further considerations

1. **Domain confirmation** — `nextjsagentkit.com` was entered but seems mismatched with "Any AI for Notion". Confirm actual domain before finalizing metadata/sitemap/robots. Recommendation: use the real product domain.
2. **ProductPreview asset** — no screenshot or Vimeo demo available yet. Recommendation: build the section with a placeholder `next/image` and swap in a real `.webp` screenshot or Vimeo ID when ready. Alternatively defer ProductPreview until an asset exists.
3. **CTA target** — where do CTAs point? The mobile app uses `notionopenai://` deep links and OAuth starts at `/api/notion-oauth/start`. Recommendation: primary CTA → App Store / Play Store (if live) or a "Get started" that explains the app; secondary CTA → `#features` anchor. Confirm store URLs.
