# Provenance

A table of shipped apps with links. Server component. Strongest credibility signal for a kit or tool product.

```tsx
// components/landing/provenance.tsx
import { ExternalLink } from 'lucide-react';
import { Container } from './container';

type App = {
  name: string;
  description: string;
  href: string;
  year: string;
};

const APPS: App[] = [
  {
    name: 'BitPong',
    description: 'A pong game for the Apple Watch.',
    href: 'https://apps.apple.com/app/bitpong/id123',
    year: '2024',
  },
  {
    name: 'Sofie',
    description: 'AI knowledge base for consultants.',
    href: 'https://sofie.app',
    year: '2025',
  },
];

export function Provenance() {
  return (
    <section id="provenance" className="py-16 md:py-24">
      <Container>
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-primary">
          In production
        </p>
        <h2 className="mb-12 max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
          Apps shipped with this kit
        </h2>
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full">
            <tbody>
              {APPS.map((app) => (
                <tr key={app.name} className="border-b border-border last:border-0">
                  <td className="px-4 py-4 align-top">
                    <a
                      href={app.href}
                      className="font-medium hover:underline"
                    >
                      {app.name}
                    </a>
                  </td>
                  <td className="px-4 py-4 align-top text-muted-foreground">
                    {app.description}
                  </td>
                  <td className="px-4 py-4 align-top text-right">
                    <a
                      href={app.href}
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      App Store
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </section>
  );
}
```

## Notes

- Only list real, live apps. Link to the App Store or the product site.
- A plain `<table>` is fine here. The shadcn `Table` primitive works too if you already added it.
- `APPS` is co-located. It is section-only data.
