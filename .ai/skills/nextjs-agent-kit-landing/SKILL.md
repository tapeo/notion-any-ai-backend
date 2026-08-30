---
name: nextjs-agent-kit-landing
description: >-
  Build a marketing landing page for a Next.js app on the Next.js Agent Kit. Use
  when implementing the home page, hero, features grid, pricing tiers, FAQ,
  testimonials, trust strip, CTA, footer, navbar, or any marketing section.
  Covers the section component pattern, the Container width primitive, typed
  data files reused for JSON-LD, the page assembly in app/page.tsx, and SEO
  (metadata, sitemap, robots, structured data).
---

# How to build a landing page

Landing pages are **opt-in**. The kit ships a minimal `app/page.tsx` placeholder. Build the full landing page when your app needs a public marketing home page with sections.

This skill distills the landing page pattern from production Next.js apps on this stack. The stack is already in the kit: Next.js 16 App Router, Tailwind v4, shadcn (base-nova), lucide-react, `tw-animate-css`. No new dependencies.

## Architecture

A landing page is a single `app/page.tsx` server component that composes self-contained section components. Each section is one file, one named export, no props. Content lives in typed arrays: shared cross-section data in `content/landing/*.ts` (reused for JSON-LD), section-only copy co-located as `const` in the section file.

```
app/
  page.tsx                       # composes Nav + <main>sections</main> + Footer, injects JSON-LD
  sitemap.ts                     # optional, static routes
  robots.ts                      # optional
  opengraph-image.tsx            # optional, dynamic OG image
content/
  landing/
    faqs.ts                      # Faq[], reused by FAQ section + FAQPage JSON-LD
    pricing.ts                   # Tier[] or price constants, reused by Pricing + SoftwareApplication JSON-LD
    testimonials.ts              # Testimonial[], optional
    metrics.ts                   # Metric[], optional
components/
  landing/
    container.tsx                # max-width + responsive px wrapper, used by every section
    nav.tsx                      # fixed top nav, backdrop blur, anchor links, mobile toggle
    footer.tsx                   # links + copyright
    hero.tsx                     # eyebrow, headline, subheading, CTAs
    product-preview.tsx         # video or screenshot embed
    features.tsx                 # lucide icon card grid
    how-it-works.tsx             # numbered steps
    use-cases.tsx                # expandable scenario cards (client)
    pricing.tsx                  # tier cards + optional waitlist form (client)
    faq.tsx                      # shadcn Accordion from content/landing/faqs.ts
    cta.tsx                      # final call to action band
    testimonials.tsx             # quotes (optional)
    trust-strip.tsx              # wordmarks (optional)
    metrics.tsx                  # stats band (optional)
    ...                          # any other section
```

## Section catalog

Full code for every section is in `references/`, one file per section. The table maps each section to its reference file, notes whether it needs `"use client"`, and one line on what it renders.

### Layout chrome

| section | client | reference | renders |
|---|---|---|---|
| Container | no | `references/container.md` | max-width + responsive px wrapper |
| Nav | yes | `references/nav.md` | fixed top bar, anchor links, mobile hamburger |
| Footer | no | `references/footer.md` | links + copyright |
| SectionTracker | yes | `references/section-tracker.md` | invisible IntersectionObserver analytics (optional) |

### Hero

| section | client | reference | renders |
|---|---|---|---|
| Hero | no | `references/hero.md` | eyebrow, headline, subheading, CTAs |
| ProductPreview | no | `references/product-preview.md` | Vimeo iframe or screenshot embed |
| Metrics | no | `references/metrics.md` | centered stats band |

### Content sections

| section | client | reference | renders |
|---|---|---|---|
| Features | no | `references/features.md` | lucide icon card grid |
| How it works | no | `references/how-it-works.md` | numbered steps, optional screenshots |
| Use cases | yes | `references/use-cases.md` | expandable scenario cards |
| Context layer | no | `references/context-layer.md` | resource/document grid |
| Skills grid | no | `references/skills.md` | data-driven skill list |
| Problem/Solution | no | `references/problem-solution.md` | 2-col numbered problem + solution text |
| Comparison | no | `references/comparison.md` | cards comparing to alternatives |
| App showcase | no | `references/app-showcase.md` | screenshot + shipped copy |
| Screenshot gallery | no | `references/screenshot-gallery.md` | 2-col figure grid |

### Social proof

| section | client | reference | renders |
|---|---|---|---|
| Trust strip | no | `references/trust-strip.md` | agent/wordmark row |
| Testimonials | no | `references/testimonials.md` | quote cards |
| Pull quote | no | `references/pull-quote.md` | centered statement |
| Bio / About | no | `references/bio.md` | profile photo + author blurb |
| Provenance | no | `references/provenance.md` | shipped apps table |

### Conversion

| section | client | reference | renders |
|---|---|---|---|
| Pricing | no | `references/pricing.md` | tier cards, server component |
| Waitlist | yes | `references/waitlist.md` | email form with state union, rendered by Pricing |
| CTA | no | `references/cta.md` | final call to action band |
| FAQ | no | `references/faq.md` | shadcn Accordion from data |

### Infrastructure

| file | renders |
|---|---|
| `references/data.md` | data location pattern + JSON-LD (FAQPage, SoftwareApplication, Organization, WebSite) |
| `references/page-assembly.md` | full `app/page.tsx` + metadata + dynamic OG image |
| `references/seo.md` | sitemap, robots, alternate SEO landing pages |

Not every landing page uses every section. Pick the sections your product needs. Hero, Features, Pricing, FAQ, CTA, Nav, Footer cover most apps.

## Conventions

These follow `.ai/ui.md`, `.ai/conventions.md`, and the kit's critical rules.

- **One section per file** in `components/landing/`. Named export, no props. Content is data-driven from typed arrays, not hardcoded markup repetition.
- **Container is the only width wrapper**. Every section wraps its inner content in `<Container>`. Do not re-declare `max-w-* mx-auto px-*` per section.
- **`<section id="...">`** on every section so nav anchor links and JSON-LD resolve. Use `scroll-padding-top` on `html` in `globals.css` to offset the fixed nav.
- **Server component by default**. Add `"use client"` only when a section needs `useState`, event handlers, or browser APIs (Nav for the mobile menu, Use cases for expansion, Pricing for the waitlist form, SectionTracker for IntersectionObserver).
- **Data location (hybrid)**:
  - Shared cross-section data (FAQs reused by the accordion and the FAQPage JSON-LD, pricing reused by the section and SoftwareApplication JSON-LD, testimonials, metrics) lives in `content/landing/*.ts` as typed exported arrays.
  - Section-only copy (use case scenarios, feature lists, steps) lives as a `const` array at the top of the section file.
  - One-off prose (hero headline, bio blurb) is hardcoded in JSX.
- **shadcn primitives** for cards, accordions, buttons, inputs, badges. Add them with `npx shadcn@latest add card accordion button input badge ...`. They land in `components/ui/`.
- **lucide-react icons** imported per component: `import { Zap, Shield, Check } from 'lucide-react'`. Type icon props as `LucideIcon`.
- **No new dependencies**. No Framer Motion, no animation library. Use `tw-animate-css` utilities and CSS transitions for motion.
- **`cn()`** from `@/lib/utils` for conditional class merging.
- **Sentence case** for all headings, eyebrows, buttons. No title case. Only proper nouns keep capitals.
- **No em dashes** in any copy. Use commas, periods, or restructure.
- **No inline ternaries**. Use if/else when conditional rendering is needed.
- **`@/*` absolute imports** for cross-feature. Relative imports (`./container`, `../data/faqs`) are fine within the `components/landing/` and `content/landing/` colocation.

## Assembly

`app/page.tsx` is a server component. It:

1. Builds JSON-LD objects (SoftwareApplication, Organization, FAQPage) from the same `content/landing/*.ts` arrays the sections use.
2. Injects them as `<script type="application/ld+json">` (rendered with `dangerouslySetInnerHTML`).
3. Renders `<Nav />`, a `<main>` stacking the sections in order, then `<Footer />`.
4. Optional: a full-bleed background `<div>` behind `<main className="relative z-10">`.

See `references/page-assembly.md` for the full `page.tsx` example, and `references/seo.md` for the SEO files.

## Alternate section backgrounds

Stripe sections to create visual rhythm. The pattern from the reference projects:

```tsx
// odd sections: default bg
// even sections: <section className="bg-primary/5 border-y border-border ...">
```

Keep the band subtle (`bg-primary/5` or `bg-muted/50`), not a hard color change. Apply the same `py-` rhythm to all sections: `py-16 md:py-24` or `py-24 md:py-32`.

## Dark mode

The kit's `app/globals.css` already defines `:root` and `.dark` token blocks. Landing sections use semantic tokens (`bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary/5`) so they adapt to both themes automatically. Do not hardcode hex colors in sections.

## Rules

- Sections take no props. All content comes from typed data arrays or co-localized copy. Props thread complexity and break the self-contained pattern.
- Never duplicate a data array. If two files need the same list (FAQ section + JSON-LD), put it in `content/landing/*.ts` and import it in both.
- JSON-LD is built from the data arrays, not re-typed inline. The FAQPage schema maps over `faqs`, the SoftwareApplication schema reads the price constant.
- The fixed nav needs `scroll-padding-top` on `html` (set in `globals.css`) equal to the nav height, so anchor links do not hide section headings behind the nav.
- Pricing waitlist form uses a discriminated state union (`'idle' | 'submitting' | 'success' | 'error'`), not a ternary for rendering. Each state renders explicitly.
- Do not fetch landing content from an API or CMS unless the project explicitly requires it. Typed arrays are the default. They keep the landing page a static server component with zero client fetches.
- Testimonials and metrics must be real. Never fabricate quotes, stats, or reviews. See the kit's "Fabricated content" anti-pattern.
- Images use `next/image` with explicit `width`/`height` to prevent layout shift. Store them in `public/` as `.webp`.

## Checklist

- [ ] `components/landing/container.tsx` created
- [ ] `components/landing/nav.tsx` + `footer.tsx` created
- [ ] `app/globals.css` has `scroll-padding-top` for the fixed nav
- [ ] `content/landing/*.ts` typed data files created for shared data
- [ ] Section components created in `components/landing/`, one per file
- [ ] shadcn primitives added (`card`, `accordion`, `button`, `input`, `badge`)
- [ ] `app/page.tsx` composes Nav + main + Footer, injects JSON-LD from data
- [ ] `app/sitemap.ts` + `robots.ts` created (optional)
- [ ] `metadata` export in `app/page.tsx` or `layout.tsx` set
- [ ] `npm run lint && tsc --noEmit` pass
- [ ] `changes/` entry created
