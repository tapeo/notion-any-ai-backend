# Container

The single width primitive. Every section imports it. Do not re-declare `max-w-* mx-auto px-*` per section. Create it first, before any section.

```tsx
// components/landing/container.tsx
export function Container({ children, className }: { children: React.ReactNode; className?: string }) {
  const base = 'mx-auto max-w-[1200px] px-6 sm:px-8';
  if (className) {
    return <div className={`${base} ${className}`}>{children}</div>;
  }
  return <div className={base}>{children}</div>;
}
```

Notes:
- `1200px` is the max width. Adjust once here if the design calls for narrower (e.g. `max-w-5xl` for a content-heavy page, `max-w-7xl` for a wide product showcase).
- Responsive horizontal padding: `px-6` mobile, `px-8` `sm` and up.
- `className` is appended, not merged through `cn()`, to keep the component dependency-free. If you need conditional overrides, switch to `cn()` from `@/lib/utils`.

## Usage

```tsx
import { Container } from './container';

export function MySection() {
  return (
    <section id="my-section" className="py-16 md:py-24">
      <Container>
        {/* content */}
      </Container>
    </section>
  );
}
```

Every section wraps its inner content in `<Container>`. The `<section>` element itself is outside the container so full-bleed backgrounds (`bg-primary/5`, `border-y`) stretch edge to edge.
