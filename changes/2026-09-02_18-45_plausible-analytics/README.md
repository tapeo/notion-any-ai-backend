## Change

Add self-hosted, cookieless Plausible analytics, ported from flutter-agent-kit-landing.

## Decisions

- Plausible host `analytics3.ricu.it` (shared instance, same as flutteragentkit.com and sofie.wiki), `data-domain="anyaifornotion.com"`.
- Script bundle includes file-downloads, outbound-links, pageview-props, tagged-events extensions; inline `window.plausible` queue shim in `components/plausible-analytics.tsx`.
- Tracking helpers in `lib/analytics.ts` (types, `trackEvent`, `Window.plausible` declaration). No `server-only`: this module is browser-only by nature, imported from client components.
- Landing sections stay server components: tracking goes through `components/landing/tracked-link.tsx` (generic client link) instead of converting sections to client. Exception: `app-store-badge.tsx` is now a client component (needs `onClick`), takes a required `source` prop.
- Events: hero primary/secondary CTA, nav link clicks + "Get the app" (desktop and mobile sheet), bottom CTA, App Store badge clicks with `source` prop (`pricing-<tier>`), GitHub link clicks (`hero` / `pricing`), section views via `section-tracker.tsx` (IntersectionObserver, threshold 0.5, fires once per section, `main section[id]`), dedicated `Section View Pricing` event.
- `section-tracker.tsx` mounted in `app/page.tsx` after Footer; script component mounted in `app/layout.tsx` end of body.
- No privacy policy page yet. Plausible is cookieless but the privacy disclosure (like the reference `/privacy`) is a follow-up.

## Files

- `components/plausible-analytics.tsx` (created)
- `lib/analytics.ts` (created)
- `components/landing/tracked-link.tsx` (created)
- `components/landing/section-tracker.tsx` (created)
- `app/layout.tsx` (modified)
- `app/page.tsx` (modified)
- `components/landing/hero.tsx` (modified)
- `components/landing/nav.tsx` (modified)
- `components/landing/cta.tsx` (modified)
- `components/landing/pricing.tsx` (modified)
- `components/landing/app-store-badge.tsx` (modified)

## Verification

`npm run lint` + `npx tsc --noEmit`; events visible in the Plausible dashboard after deploy.