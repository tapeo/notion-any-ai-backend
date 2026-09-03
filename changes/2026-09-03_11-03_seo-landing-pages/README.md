## Change

Added the first 3 SEO landing pages (priority set): `/notion-ai-alternative`, `/notion-byok`, `/connect/chatgpt-to-notion`, with a shared page shell for the remaining 9 planned pages.

## Decisions

- SEO content lives in `content/seo/*.ts` driven by a `SeoPageContent` type in `content/seo/types.ts`; pages in `app/` are thin (metadata + JSON-LD + `<SeoPage />`).
- Shared shell in `components/seo/`: `seo-page.tsx` (Nav, hero, sections, optional comparison table, FAQ, CTA, Footer), `comparison-table.tsx` (supports boolean or string cells), `faq-section.tsx`, `cta-section.tsx`.
- CTA on SEO pages: primary App Store badge (iOS listing), secondary GitHub "build from source" link. Tracked with `CTA Click SEO Page` (props: `source: seo-<slug>`, `target: github`).
- Copy claims per owner decision: iOS on App Store, Linux via snap, all-platform builds from the open source repo. No desktop store claims.
- Footer gained links to the 3 new pages (full "Compare" and "Integrations" groups deferred to phase 2).
- Sitemap restructured into a `PAGES` array; add future pages there with priorities.
- Phase 2 (not yet built): `/vs/notion-ai`, `/vs/notion-mcp`, `/connect/claude-to-notion`, `/connect/gemini-to-notion`, `/connect/local-llm-to-notion`, `/chat-with-notion`, `/notion-ai-mobile-app`, `/notion-ai-lifetime`, `/open-source-notion-ai`, homepage internal links.
- No lint script exists in this repo; verify with `npx tsc --noEmit` and `./npm.sh run build` (Docker wrapper, node_modules holds Linux binaries so host builds fail on lightningcss).

## Verification

`npx tsc --noEmit` clean; `./npm.sh run build` passes with all 3 new routes prerendered as static.

## Files

- `content/seo/types.ts` (created)
- `content/seo/notion-ai-alternative.ts` (created)
- `content/seo/notion-byok.ts` (created)
- `content/seo/chatgpt-to-notion.ts` (created)
- `components/seo/seo-page.tsx` (created)
- `components/seo/comparison-table.tsx` (created)
- `components/seo/faq-section.tsx` (created)
- `components/seo/cta-section.tsx` (created)
- `app/notion-ai-alternative/page.tsx` (created)
- `app/notion-byok/page.tsx` (created)
- `app/connect/chatgpt-to-notion/page.tsx` (created)
- `app/sitemap.ts` (modified)
- `components/landing/footer.tsx` (modified)
- `lib/analytics.ts` (modified)