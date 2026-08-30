# SectionTracker

An invisible client component that watches each `main section[id]` with `IntersectionObserver` and fires an analytics event once per section view. Useful for understanding scroll depth.

```tsx
// components/landing/section-tracker.tsx
'use client';

import { useEffect } from 'react';

export function SectionTracker() {
  useEffect(() => {
    const sections = document.querySelectorAll('main section[id]');
    const seen = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.target instanceof HTMLElement) {
            const id = entry.target.id;
            if (!seen.has(id)) {
              seen.add(id);
              // fire analytics event, e.g. Plausible:
              // window.plausible?.('Section View', { props: { id } });
            }
          }
        }
      },
      { threshold: 0.5 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return null;
}
```

## Notes

- Mount it once in `app/page.tsx` after `<Nav />`. It renders nothing.
- The `seen` set guarantees each section counts once per page load.
- Replace the comment with your analytics call (Plausible, PostHog, GA4).
- `threshold: 0.5` fires when half the section is visible. Lower it for tall sections, raise it for short ones.
- Optional. Skip it if you do not track scroll depth.

## Usage in page.tsx

```tsx
import { Nav } from '@/components/landing/nav';
import { SectionTracker } from '@/components/landing/section-tracker';
import { Footer } from '@/components/landing/footer';

export default function Home() {
  return (
    <>
      <Nav />
      <SectionTracker />
      <main className="pt-16">
        {/* sections */}
      </main>
      <Footer />
    </>
  );
}
```
