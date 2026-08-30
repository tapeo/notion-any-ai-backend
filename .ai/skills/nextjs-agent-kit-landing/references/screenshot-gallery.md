# Screenshot gallery

Two-column figure grid with captions. Server component.

```tsx
// components/landing/screenshot-gallery.tsx
import Image from 'next/image';
import { Container } from './container';

type Shot = { src: string; alt: string; caption: string };

const SHOTS: Shot[] = [
  { src: '/gallery/demo-1.webp', alt: 'Demo one', caption: 'The editor with live preview.' },
  { src: '/gallery/demo-2.webp', alt: 'Demo two', caption: 'The diff view for revisions.' },
];

export function ScreenshotGallery() {
  return (
    <section id="screenshots" className="py-16 md:py-24">
      <Container>
        <h2 className="mb-12 text-center text-3xl font-semibold tracking-tight md:text-4xl">
          See it in action
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {SHOTS.map((shot) => (
            <figure key={shot.src}>
              <div className="overflow-hidden rounded-lg border border-border">
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  width={600}
                  height={375}
                  className="h-auto w-full"
                />
              </div>
              <figcaption className="mt-3 text-center text-sm text-muted-foreground">
                {shot.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}
```

## Notes

- `<figure>`/`<figcaption>` is the semantic pair for image with caption.
- Keep captions to one line. Long captions push the grid out of alignment.
- `SHOTS` is co-located. It is section-only data.
