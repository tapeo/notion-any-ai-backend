## Change

Landing page launch prep: fixed the dead pricing CTA, aligned platform claims with iOS-only reality, and completed the SEO surface (OG image, canonical, Organization/WebSite JSON-LD).

## Decisions

- Pricing App Store badge links to https://apps.apple.com/us/app/any-ai-for-notion/id6789153536 (was a self-referencing `#pricing` anchor).
- `operatingSystem` is `"iOS"` only: no Play Store link exists yet. Add Android back to the JSON-LD and copy when a Play Store listing ships.
- `app/opengraph-image.tsx` (1200x630, next/og) recreates the logo sparkle with the 45° rotation baked into the path because satori `transform` support is unverified. The dot is NOT rotated (matches logo.svg, where only the path carries `transform`). Geometry was pixel-diff validated against a qlmanage render of logo.svg: 0.28% AA delta, max 4/255.
- `alternates.canonical: "/"` in `app/page.tsx` metadata resolves against metadataBase.
- One combined `@graph` JSON-LD script holds Organization + WebSite; FAQPage and SoftwareApplication stay in their own scripts.
- Kept hero/nav/CTA "Get the app" buttons as `#pricing` anchors (funnel into the section); only the pricing badge goes to the App Store.
- Skipped by user request: favicon/app-icon work (favicon.ico, icon0.svg, icon1.png, manifest.json already exist in `app/`, added outside this change).

## Files

- `content/landing/pricing.ts` (modified)
- `app/page.tsx` (modified)
- `app/opengraph-image.tsx` (created)
- `components/landing/product-preview.tsx` (modified)

## Verification

`tsc --noEmit` and `next build` pass; built HTML head shows single title, canonical, og:image/twitter:image 1200x630, and all three JSON-LD scripts.
