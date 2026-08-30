# Comparison

Cards comparing your product to alternatives. Server component. Be factual, do not disparage.

```tsx
// components/landing/comparison.tsx
import { Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Container } from './container';

type Row = { feature: string; you: boolean; alt: boolean };
type Alt = { name: string };

const ALTERNATIVES: Alt[] = [{ name: 'Notion' }, { name: 'Confluence' }];

const ROWS: Row[] = [
  { feature: 'Auto-generated docs', you: true, alt: false },
  { feature: 'Live context from chat', you: true, alt: false },
  { feature: 'Version history', you: true, alt: true },
  { feature: 'Granular permissions', you: true, alt: true },
];

export function Comparison() {
  return (
    <section id="compare" className="py-16 md:py-24">
      <Container>
        <h2 className="mb-12 text-center text-3xl font-semibold tracking-tight md:text-4xl">
          Why teams switch
        </h2>
        <Card>
          <CardHeader>
            <div className="grid grid-cols-3 gap-4">
              <span />
              <span className="text-center font-medium">Your app</span>
              <span className="text-center font-medium text-muted-foreground">Alternatives</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ROWS.map((row) => (
                <div key={row.feature} className="grid grid-cols-3 items-center gap-4 border-t border-border pt-3 first:border-0 first:pt-0">
                  <span className="text-sm text-muted-foreground">{row.feature}</span>
                  <span className="flex justify-center">
                    {row.you ? <Check className="h-5 w-5 text-primary" /> : <X className="h-5 w-5 text-muted-foreground" />}
                  </span>
                  <span className="flex justify-center">
                    {row.alt ? <Check className="h-5 w-5 text-primary" /> : <X className="h-5 w-5 text-muted-foreground" />}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </Container>
    </section>
  );
}
```

## Notes

- The check/cross icons use inline ternaries (`row.you ? <Check/> : <X/>`) for icon selection. This is a single-value pick, not a nested conditional tree. If your linter flags it, extract to a helper.
- `ROWS` and `ALTERNATIVES` are co-located. They are section-only data.
- Be factual. Do not fabricate comparison points. Only list features you and the alternative actually have or lack.
