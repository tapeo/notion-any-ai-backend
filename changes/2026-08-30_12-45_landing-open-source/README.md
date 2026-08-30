# Landing page open source mention

## summary

Made it clear on the landing page that the project is paid but also fully
open source. Added the GitHub repo link (github.com/tapeo/notion-any-ai) in
the hero, pricing, FAQ, and footer, plus open-source mentions in the CTA and
page metadata. The framing is "both combined": the purchase supports ongoing
development, and the App Store listing provides the convenient install with
automatic updates, while the code remains free to inspect or self-build.

## files

- `components/landing/hero.tsx` - exported `GITHUB_URL` constant, added a
  muted line under the CTA buttons linking to the repo ("open source on
  GitHub").
- `components/landing/pricing.tsx` - added a second subtitle paragraph
  ("The app is paid but fully open source...") with a GitHub link.
- `content/landing/pricing.ts` - added tier feature "Fully open source,
  inspect the code".
- `content/landing/faqs.ts` - added FAQ entry "Is the app open source?" with
  the support-development + App-store-convenience framing and the repo URL.
  `Faq` type gained an optional `link` field; the open-source entry links to
  the repo ("View the source code on GitHub").
- `components/landing/faq.tsx` - renders the optional FAQ link as an external
  anchor with a lucide ArrowUpRight icon below the answer.
- `components/landing/cta.tsx` - extended subline with "fully open source".
- `components/landing/footer.tsx` - added external GitHub link; footer links
  now distinguish internal `Link` from external `<a target="_blank"
  rel="noopener noreferrer">`.
- `app/page.tsx` - metadata descriptions mention "open source" for SEO.

## notes

- `GITHUB_URL` lives in `components/landing/hero.tsx` and is imported by
  `pricing.tsx`; footer duplicates the URL string in its link list.
- New FAQ is automatically included in the FAQPage JSON-LD since it shares
  the `FAQS` array.
- No `npm run lint` script or ESLint config exists in this repo; verified
  with `npx tsc --noEmit` (passes).