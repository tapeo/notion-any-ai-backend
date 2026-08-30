# Metrics band

Three or four centered stats. Server component. Keep it to real numbers only.

## Co-located data

```tsx
// components/landing/metrics.tsx
import { Container } from './container';

type Metric = { value: string; label: string };

const METRICS: Metric[] = [
  { value: '10k+', label: 'Active users' },
  { value: '99.9%', label: 'Uptime' },
  { value: '4.8/5', label: 'Average rating' },
];

export function Metrics() {
  return (
    <section className="border-y border-border bg-primary/5 py-12">
      <Container>
        <dl className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {METRICS.map((metric) => (
            <div key={metric.label} className="text-center">
              <dd className="text-3xl font-semibold tracking-tight md:text-4xl">
                {metric.value}
              </dd>
              <dt className="mt-1 text-sm text-muted-foreground">
                {metric.label}
              </dt>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
```

## Shared data variant

If the metrics are reused elsewhere (another page, JSON-LD), move `METRICS` to `content/landing/metrics.ts` and import it.

```ts
// content/landing/metrics.ts
export type Metric = { value: string; label: string };
export const METRICS: Metric[] = [
  { value: '10k+', label: 'Active users' },
  { value: '99.9%', label: 'Uptime' },
  { value: '4.8/5', label: 'Average rating' },
];
```

```tsx
import { METRICS } from '@/content/landing/metrics';
// map over METRICS in the component, same markup as above
```

## Notes

- `bg-primary/5` is the subtle band tint. Alternate it with default `bg-background` between sections.
- `<dl>`/`<dt>`/`<dd>` is the semantic choice for stat/label pairs. Screen readers announce them correctly.
- Never fabricate metrics. Real numbers only, per the kit's fabricated content rule.
- This section has no `id` because it is not an anchor target. Add one if the nav links to it.
