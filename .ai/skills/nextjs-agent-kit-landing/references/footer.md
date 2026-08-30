# Footer

Server component. Links and copyright. Keep it simple.

```tsx
// components/landing/footer.tsx
import Link from 'next/link';

const FOOTER_LINKS: { href: string; label: string }[] = [
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: 'https://example.com', label: 'Blog' },
];

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row sm:px-8">
        <p className="text-sm text-muted-foreground">
          Built with the Next.js Agent Kit.
        </p>
        <nav className="flex gap-6">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
```

## Notes

- The footer does not use `<Container>`. It re-declares the same `max-w-[1200px] px-6 sm:px-8` pattern because the footer is a standalone chrome element, not a section inside `<main>`. This is the one exception to the container rule.
- `FOOTER_LINKS` is co-located, not in `content/landing/`. Footer links are rarely reused.
- The copyright text uses sentence case. Replace "Built with the Next.js Agent Kit." with your own line.
