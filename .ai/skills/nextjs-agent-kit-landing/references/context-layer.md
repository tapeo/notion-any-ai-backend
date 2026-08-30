# Context layer

A grid of resources or documents the product understands. Server component.

```tsx
// components/landing/context-layer.tsx
import { Container } from './container';

type Doc = { name: string; description: string };

const DOCS: Doc[] = [
  { name: 'architecture.md', description: 'System design and service boundaries.' },
  { name: 'data.md', description: 'Schema references and migration notes.' },
  { name: 'api.md', description: 'Endpoint contracts and examples.' },
  { name: 'runbook.md', description: 'Incident response steps.' },
];

export function ContextLayer() {
  return (
    <section id="context" className="py-16 md:py-24">
      <Container>
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-primary">
          On-demand context
        </p>
        <h2 className="mb-12 max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
          Reads the docs you already have
        </h2>
        <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
          {DOCS.map((doc) => (
            <li key={doc.name} className="bg-card p-6">
              <code className="font-mono text-sm font-medium">{doc.name}</code>
              <p className="mt-2 text-sm text-muted-foreground">{doc.description}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
```

## Notes

- The `gap-px` on a `bg-border` grid draws 1px dividers between cells without extra elements.
- `DOCS` is co-located. It is section-only data.
- Use this section when the product reads or generates documentation. Swap the doc names for whatever resources your product understands.
