# Landing page

## summary

Added a marketing landing page for "Any AI for Notion" to the existing
pure-backend Next.js 16 repo. Brought up the full frontend stack (Tailwind v4,
shadcn base-nova, lucide-react, tw-animate-css), then built the chrome (Nav,
Footer, Container), eight content sections (Hero, ProductPreview, Features,
TrustStrip, Comparison, Pricing, FAQ, CTA), typed data files, JSON-LD
structured data, and SEO routes (sitemap, robots). Single lifetime pricing
tier ($99, was $199). No waitlist, no fabricated testimonials or metrics.

## files

### Foundation

- `postcss.config.mjs` - new, Tailwind v4 PostCSS plugin.
- `app/globals.css` - new, Tailwind + tw-animate-css imports, shadcn theme
  tokens (oklch), `scroll-padding-top: 4rem` for fixed nav anchor offset.
- `app/layout.tsx` - new, root layout with Inter font, metadata title template,
  inline theme-init script (no FOUC), dark mode support.
- `components.json` - new, shadcn base-nova config (neutral base color, lucide
  icons, RSC on).
- `lib/utils.ts` - new (via shadcn init), `cn()` (clsx + tailwind-merge).
- `components/ui/button.tsx` - new (via shadcn), base-ui Button with variants.
- `components/ui/card.tsx` - new (via shadcn).
- `components/ui/accordion.tsx` - new (via shadcn), base-ui Accordion.
- `components/ui/badge.tsx` - new (via shadcn).

### Chrome

- `components/landing/container.tsx` - `Container` max-width wrapper.
- `components/landing/nav.tsx` - `Nav` (client), fixed top bar, anchor links,
  mobile hamburger with lucide Menu icon.
- `components/landing/footer.tsx` - `Footer`, co-located `FOOTER_LINKS`.

### Data

- `content/landing/faqs.ts` - `Faq` type, `FAQS` array (6 Q&A pairs). Shared by
  FAQ section + FAQPage JSON-LD.
- `content/landing/pricing.ts` - `Tier` type, `TIERS` array (single lifetime
  tier, $99 one-time, was $199). Shared by Pricing section +
  SoftwareApplication JSON-LD.

### Sections

- `components/landing/hero.tsx` - `Hero`, centered variant, eyebrow + headline +
  subheading + two CTAs.
- `components/landing/product-preview.tsx` - `ProductPreview`, placeholder
  (screenshot coming soon).
- `components/landing/features.tsx` - `Features`, 6 lucide icon cards in a
  responsive 1/2/3 grid.
- `components/landing/trust-strip.tsx` - `TrustStrip`, 7 AI agent wordmarks.
- `components/landing/comparison.tsx` - `Comparison`, Any AI for Notion vs
  Notion AI, 7 factual rows with Check/X icons.
- `components/landing/pricing.tsx` - `Pricing` + `TierCard`, single lifetime
  tier with "was $199" strikethrough and Lifetime badge.
- `components/landing/faq.tsx` - `Faq`, base-ui Accordion from `FAQS`.
- `components/landing/cta.tsx` - `CTA`, final call to action band.

### Page + SEO

- `app/page.tsx` - new, landing page server component. Composes Nav + 8
  sections + Footer. Injects FAQPage and SoftwareApplication JSON-LD from the
  shared data arrays. Exports metadata with OG and Twitter cards.
- `app/sitemap.ts` - new, `/` route, weekly, priority 1.
- `app/robots.ts` - new, disallow `/api`, sitemap URL.

### Cleanup

- Removed default Next.js SVGs from `public/` (`next.svg`, `vercel.svg`,
  `file.svg`, `globe.svg`, `window.svg`).

## notes

- shadcn CLI v4.16.2 uses `--preset nova` (not `--style base-nova`) and `--base
base`. The preset creates `lib/utils.ts` (not `lib/client/utils.ts`), so all
  imports use `@/lib/utils`.
- base-ui Button uses `render={<Link />}` + `nativeButton={false}` instead of
  the Radix `asChild` pattern.
- base-ui Accordion does not take a `type` prop; multiple selection is the
  default (value is an array).
- Domain set to `anyaifornotion.com` (placeholder, needs confirmation).
- ProductPreview is a placeholder; needs a real screenshot or Vimeo ID.
- TrustStrip lists AI agents (ChatGPT, Claude, Gemini, Cursor, Copilot, Codex,
  Amp); needs confirmation of the real supported list.
- Comparison compares against Notion AI; needs confirmation of alternatives.
- All copy is placeholder to be refined.

## usage

```bash
npm run dev   # http://localhost:3000
npm run build # standalone output for Docker
```
