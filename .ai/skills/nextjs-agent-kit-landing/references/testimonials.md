# Testimonials

Quote cards. Server component. Real quotes only, with attribution and a link where possible.

## Shared data

When reused across pages or in JSON-LD, move to `content/landing/testimonials.ts`.

```ts
// content/landing/testimonials.ts
export type Testimonial = {
  quote: string;
  author: string;
  role: string;
  href?: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    quote: 'We cut onboarding time from two weeks to two days. The wiki writes itself.',
    author: 'Sarah Chen',
    role: 'Engineering lead, Acme',
    href: 'https://example.com/sarah',
  },
  {
    quote: 'The first knowledge tool our team actually keeps updated.',
    author: 'Marcus Lee',
    role: 'CTO, Studio Five',
  },
];
```

## Component

```tsx
// components/landing/testimonials.tsx
import { Card, CardContent } from '@/components/ui/card';
import { TESTIMONIALS } from '@/content/landing/testimonials';
import { Container } from './container';

export function Testimonials() {
  return (
    <section id="testimonials" className="py-16 md:py-24">
      <Container>
        <h2 className="mb-12 text-center text-3xl font-semibold tracking-tight md:text-4xl">
          Teams ship faster
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {TESTIMONIALS.map((testimonial) => (
            <Card key={testimonial.author}>
              <CardContent>
                <blockquote className="text-lg leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <div className="mt-4 flex items-center gap-3">
                  <div>
                    <p className="font-medium">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                  {testimonial.href && (
                    <a
                      href={testimonial.href}
                      className="ml-auto text-sm text-primary hover:underline"
                    >
                      Read the case study
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
```

## Notes

- Use real, attributable quotes. Cite them verbatim. Never invent testimonials.
- `&ldquo;`/`&rdquo;` render curly quotes. Avoid straight `"` inside JSX text to keep typography clean.
- Two columns on `md`, one on mobile. Three columns works for short quotes.
- If the testimonials are only used here, co-locate them as a `const` in the component instead of a data file.
