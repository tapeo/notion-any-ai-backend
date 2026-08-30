# CTA

Final call to action band. Server component. One headline, one button. The last thing before the footer.

```tsx
// components/landing/cta.tsx
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from './container';

export function CTA() {
  return (
    <section className="border-y border-border bg-primary/5 py-16 md:py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Start writing less today
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Free to start. No credit card required.
          </p>
          <Button
            render={<Link href="/auth" />}
            nativeButton={false}
            size="lg"
            className="mt-8"
          >
            Get started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </Container>
    </section>
  );
}
```

## Notes

- `size="lg"` is a shadcn button variant. Confirm your `button.tsx` includes the `lg` size when you add it.
- No `id` on this section. It is not an anchor target.
- The copy is one-off prose, hardcoded in JSX.
- `bg-primary/5 border-y` gives the band its tint. Alternate with surrounding sections.
- `Button render={<Link />}` with `nativeButton={false}` is the base-ui pattern for rendering a link with button styles (replaces the Radix `asChild` prop).
