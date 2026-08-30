# Pull quote

A single centered statement. Server component. Use for the one line you want to land.

```tsx
// components/landing/pull-quote.tsx
import { Container } from './container';

export function PullQuote() {
  return (
    <section className="py-16 md:py-24">
      <Container>
        <blockquote className="mx-auto max-w-3xl text-center text-2xl font-medium leading-relaxed tracking-tight md:text-3xl">
          The best documentation is the documentation no one has to write.
        </blockquote>
      </Container>
    </section>
  );
}
```

## Notes

- The quote is one-off prose, hardcoded in JSX. It does not go in a data file.
- No `id` on this section. It is not an anchor target.
- Keep it to one or two lines. A pull quote is not a paragraph.
