# Nav

Fixed top navigation. Client component because it tracks the mobile menu open state. Anchor links jump to section IDs on the page.

```tsx
// components/landing/nav.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';

type NavLink = { href: string; label: string };

const LINKS: NavLink[] = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
];

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6 sm:px-8">
        <Link href="/" className="text-base font-semibold tracking-tight">
          my-app
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/auth"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Get started
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="md:hidden"
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </nav>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-1 px-6 py-3">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/auth"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-md bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground"
            >
              Get started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
```

## Notes

- `bg-background/80 backdrop-blur` keeps content readable as the user scrolls.
- `z-50` sits above section content. `<main>` needs `pt-16` or the nav covers the hero.
- Anchor links use plain `<a href="#id">`, not `next/link`, because they are same-page jumps.
- The mobile toggle uses an inline SVG to avoid a lucide icon dependency here. You can swap it for `import { Menu } from 'lucide-react'` and render `<Menu className="h-6 w-6" />`.

## `scroll-padding-top`

Add this to `app/globals.css` so anchor links do not hide headings behind the fixed nav:

```css
html {
  scroll-behavior: smooth;
  scroll-padding-top: 4rem;
}
```

The `4rem` matches the `h-16` nav height. Adjust both together if you change the nav height.
