# Hero

Server component. Eyebrow, headline, subheading, two CTAs. The first impression of the landing page.

## Centered variant

```tsx
// components/landing/hero.tsx
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container } from './container';

export function Hero() {
  return (
    <section id="top" className="pt-16 pb-16 md:pt-24 md:pb-20">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-primary">
            AI knowledge base for teams
          </p>
          <h1 className="mb-6 text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
            Write less, ship more. The wiki that builds itself.
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Your team&apos;s conversations become a living knowledge base.
            No more stale docs, no more repeated questions.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              href="/auth"
              className="inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
            >
              Get started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center rounded-md border border-border px-6 py-3 text-sm font-medium"
            >
              See how it works
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
```

## Left-aligned variant

For product pages with a screenshot on the right:

```tsx
export function Hero() {
  return (
    <section id="top" className="pt-16 pb-16 md:pt-24">
      <Container>
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-primary">
              Eyebrow
            </p>
            <h1 className="mb-6 text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
              Headline
            </h1>
            <p className="mb-8 text-lg text-muted-foreground">
              Subheading.
            </p>
            <div className="flex gap-3">
              {/* CTAs */}
            </div>
          </div>
          <div>
            {/* screenshot or ProductPreview */}
          </div>
        </div>
      </Container>
    </section>
  );
}
```

## Notes

- The eyebrow is a short uppercase label above the headline. Use `text-primary` to tie it to the brand color. Sentence case inside the eyebrow only if it is a proper noun.
- One headline, one subheading, two CTAs max. Primary CTA goes to `/auth` (or `/signup`), secondary CTA is an anchor to a section.
- `tracking-tight` on large headings improves density. `leading-tight` prevents awkward line breaks.
- Use `&apos;` for apostrophes in JSX text, or rely on the kit eslint config which sets `react/no-unescaped-entities: 'off'`.
- The hero copy is one-off prose, hardcoded in JSX. It does not belong in a data file.
