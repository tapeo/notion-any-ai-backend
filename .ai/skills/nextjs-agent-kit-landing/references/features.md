# Features

lucide icon card grid. The most common content section. Server component. Uses the shadcn `Card` primitive.

Add the primitive first:

```bash
npx shadcn@latest add card
```

```tsx
// components/landing/features.tsx
import type { LucideIcon } from 'lucide-react';
import { Zap, Shield, Clock, GitBranch, BarChart, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Container } from './container';

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const FEATURES: Feature[] = [
  {
    icon: Zap,
    title: 'Instant sync',
    description: 'Changes propagate to every client in under 100ms. No refresh needed.',
  },
  {
    icon: Shield,
    title: 'Secure by default',
    description: 'End-to-end encryption with rotating keys. Your data stays yours.',
  },
  {
    icon: Clock,
    title: 'Time travel',
    description: 'Every edit is versioned. Roll back to any point in the document history.',
  },
  {
    icon: GitBranch,
    title: 'Branching',
    description: 'Draft changes on a branch, merge when ready. Reviewers see the diff.',
  },
  {
    icon: BarChart,
    title: 'Usage insights',
    description: 'See which pages get read, which get stale, where time is spent.',
  },
  {
    icon: Lock,
    title: 'Granular access',
    description: 'Per-space and per-page permissions. Invite external collaborators safely.',
  },
];

export function Features() {
  return (
    <section id="features" className="py-16 md:py-24">
      <Container>
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Everything you need to keep knowledge alive
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            The tools your team already uses, connected to a wiki that writes itself.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title}>
                <CardHeader>
                  <Icon className="h-6 w-6 text-primary" />
                  <CardTitle className="mt-2">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
```

## Notes

- `LucideIcon` is the type for any lucide icon component. Store the component (not a string) in the data array and render it as `<Icon className="..." />`.
- Responsive grid: 1 col mobile, 2 col `sm`, 3 col `lg`. Adjust the breakpoint and count per design.
- Assign the `icon` to a local `Icon` variable before rendering. JSX requires capitalized component names.
- Keep feature descriptions to one sentence. Long descriptions break the card grid rhythm.
- `FEATURES` is co-located. It is section-only data, not reused for JSON-LD.
