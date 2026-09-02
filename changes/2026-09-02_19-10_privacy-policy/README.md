## Change

Add a privacy policy page at `/privacy`, adapted from flutter-agent-kit-landing, and link it from the footer.

## Decisions

- Contact email published in the policy: `info@matteoricupero.it` (owner's choice, replaces the `hello@<domain>` pattern of the reference site).
- Content adapted to this product: App Store purchase via Apple (no payment provider email collection), Notion OAuth access token lifecycle, AI agent proxy that does not persist page content, self-hosted Plausible analytics disclosure including custom events (CTA clicks, section views, App Store badge).
- Styled with this site's design tokens (shadcn variables, `Container`, `Nav`, `Footer`), not the reference site's custom palette. Nav is transparent-on-page; sections use `scroll-mt-24` for the fixed header.
- `/privacy` is outside `main`, so `section-tracker.tsx` does not track section views on it (it queries `main section[id]`; policy sections have no `id` conflicts). Wait: policy sections do have ids but are outside `main`, so no `Section View` events fire there. Confirmed intended.
- Footer gains a `/privacy` internal link.
- `metadata.alternates.canonical` set to `/privacy`; indexable.

## Files

- `app/privacy/page.tsx` (created)
- `components/landing/footer.tsx` (modified)

## Verification

`npx tsc --noEmit` clean, `next build` prerenders `/privacy` as static.