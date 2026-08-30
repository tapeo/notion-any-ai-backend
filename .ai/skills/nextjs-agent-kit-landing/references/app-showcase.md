# App showcase

Screenshot plus shipped copy. Server component. Use when the product is itself an app with an App Store presence.

```tsx
// components/landing/app-showcase.tsx
import Image from 'next/image';
import Link from 'next/link';
import { Container } from './container';

export function AppShowcase() {
  return (
    <section id="showcase" className="py-16 md:py-24">
      <Container>
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="overflow-hidden rounded-lg border border-border">
            <Image
              src="/app-screenshot.webp"
              alt="App in production"
              width={600}
              height={400}
              className="h-auto w-full"
            />
          </div>
          <div>
            <h2 className="mb-4 text-3xl font-semibold tracking-tight md:text-4xl">
              Shipped and in production
            </h2>
            <p className="mb-6 text-lg text-muted-foreground">
              The same kit powers apps already in the App Store. Not a demo.
            </p>
            <Link
              href="https://apps.apple.com/app/id123"
              className="inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
            >
              View on the App Store
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
```

## Notes

- The screenshot and copy are one-off, hardcoded in JSX.
- Swap the App Store link for a Play Store link or a product URL as needed.
- Use `next/image` with explicit `width` and `height` to prevent layout shift.
