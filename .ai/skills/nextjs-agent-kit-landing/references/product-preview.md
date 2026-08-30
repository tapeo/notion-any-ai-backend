# ProductPreview

Embeds a demo video or a product screenshot. Server component. Sits below the hero.

## Vimeo embed

```tsx
// components/landing/product-preview.tsx
import { Container } from './container';

const VIMEO_ID = '123456789';

export function ProductPreview() {
  return (
    <section id="preview" className="py-16 md:py-20">
      <Container>
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="relative aspect-video w-full">
            <iframe
              src={`https://player.vimeo.com/video/${VIMEO_ID}`}
              className="absolute inset-0 h-full w-full"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title="Product demo"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
```

If you use the Vimeo player JS API, load the script with `next/script` in `app/page.tsx`:

```tsx
import Script from 'next/script';

<Script src="https://player.vimeo.com/api/player.js" strategy="afterInteractive" />
```

## Screenshot with next/image

```tsx
import Image from 'next/image';
import { Container } from './container';

export function ProductPreview() {
  return (
    <section id="preview" className="py-16 md:py-20">
      <Container>
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <Image
            src="/product-screenshot.webp"
            alt="Product dashboard"
            width={1200}
            height={675}
            className="h-auto w-full"
            priority
          />
        </div>
      </Container>
    </section>
  );
}
```

## Notes

- `aspect-video` gives a 16:9 ratio. The iframe is absolutely positioned to fill it.
- Store screenshots in `public/` as `.webp`. Always set explicit `width` and `height` to prevent layout shift.
- `priority` on the hero-adjacent screenshot improves LCP. Use it only for the first viewport image.
- `VIMEO_ID` is co-located. It is a single constant, not worth a data file.
