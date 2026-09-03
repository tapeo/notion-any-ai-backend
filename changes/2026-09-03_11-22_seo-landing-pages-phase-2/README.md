## Change

Completed the SEO page set: added the remaining 9 landing pages (2 vs pages, 3 more connectors, 4 intent pages), full footer link groups, and a homepage internal links section. All 12 planned pages are now live.

## Decisions

- Shared JSON-LD helpers in `components/seo/json-ld.tsx` (`FaqJsonLd`, `AppJsonLd`, `BreadcrumbJsonLd`); phase-1 pages refactored to use them. BreadcrumbJsonLd exists but is not mounted on any page yet.
- Footer redesigned into 4 columns: Compare, Integrations, Use cases, Site (via `FooterGroupColumn`/`FooterLinkItem`).
- Homepage gets `InternalLinks` section between FAQ and CTA, linking all SEO pages in 3 groups.
- Sitemap holds all 12 URLs with priorities: 0.9 for the 3 priority pages, 0.8 for vs/connect/use-case pages, 0.7 for lifetime and open source.
- Copy constraints held: iOS App Store distribution, Linux snap, all-platform builds from GitHub source; no desktop store claims. No em dashes, sentence case.
- Page routes are thin: import content file, export metadata, render `FaqJsonLd` + `AppJsonLd` + `SeoPage`. Comparison tables only on `/vs/notion-ai`, `/vs/notion-mcp`, `/notion-byok` (string cells supported for price rows).
- Verify with `npx tsc --noEmit` and `./npm.sh run build` (host `npm run build` fails: node_modules has Linux binaries from the Docker wrapper).

## Verification

`npx tsc --noEmit` clean; `./npm.sh run build` passes with all 12 SEO routes prerendered static; em dash sweep clean.

## Files

- `components/seo/json-ld.tsx` (created)
- `content/seo/vs-notion-ai.ts` (created)
- `content/seo/vs-notion-mcp.ts` (created)
- `content/seo/claude-to-notion.ts` (created)
- `content/seo/gemini-to-notion.ts` (created)
- `content/seo/local-llm-to-notion.ts` (created)
- `content/seo/chat-with-notion.ts` (created)
- `content/seo/notion-ai-mobile-app.ts` (created)
- `content/seo/notion-ai-lifetime.ts` (created)
- `content/seo/open-source-notion-ai.ts` (created)
- `app/vs/notion-ai/page.tsx` (created)
- `app/vs/notion-mcp/page.tsx` (created)
- `app/connect/claude-to-notion/page.tsx` (created)
- `app/connect/gemini-to-notion/page.tsx` (created)
- `app/connect/local-llm-to-notion/page.tsx` (created)
- `app/chat-with-notion/page.tsx` (created)
- `app/notion-ai-mobile-app/page.tsx` (created)
- `app/notion-ai-lifetime/page.tsx` (created)
- `app/open-source-notion-ai/page.tsx` (created)
- `app/notion-ai-alternative/page.tsx` (modified, refactored to json-ld helpers)
- `app/notion-byok/page.tsx` (modified, same)
- `app/connect/chatgpt-to-notion/page.tsx` (modified, same)
- `app/page.tsx` (modified, added InternalLinks section)
- `components/landing/internal-links.tsx` (created)
- `components/landing/footer.tsx` (rewritten with grouped columns)
- `app/sitemap.ts` (modified, all 12 URLs)