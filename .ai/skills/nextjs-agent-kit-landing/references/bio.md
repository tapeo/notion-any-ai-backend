# Bio / About

Profile photo plus author blurb. Server component. Use when the product has a single maker or a small team worth featuring.

```tsx
// components/landing/bio.tsx
import Image from 'next/image';
import Link from 'next/link';
import { Container } from './container';

export function Bio() {
  return (
    <section id="bio" className="py-16 md:py-24">
      <Container>
        <div className="flex flex-col items-start gap-8 md:flex-row">
          <div className="shrink-0">
            <Image
              src="/profile.webp"
              alt="The author"
              width={120}
              height={120}
              className="rounded-full border border-border"
            />
          </div>
          <div className="max-w-2xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-primary">
              About
            </p>
            <p className="text-lg leading-relaxed text-muted-foreground">
              I am Matteo, an independent software engineer. I have shipped
              production apps with this stack for the last five years. This kit
              is the setup I wish I had on day one.
            </p>
            <Link
              href="https://ricu.it"
              className="mt-4 inline-flex text-sm text-primary hover:underline"
            >
              Read more
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
```

## Notes

- Use a square photo, at least 240px, served as `.webp`.
- Keep the blurb to two or three sentences. Link to a longer about page.
- The blurb is one-off prose, hardcoded in JSX. It does not go in a data file.
