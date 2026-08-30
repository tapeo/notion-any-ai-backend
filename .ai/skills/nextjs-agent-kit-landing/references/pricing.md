# Pricing

Tier cards. Server component. The price data lives in `content/landing/pricing.ts` so it feeds both the cards and the SoftwareApplication JSON-LD.

If you want a waitlist form below the cards, see `references/waitlist.md`. The form is a separate client component. Pricing stays a server component.

Add the primitives:

```bash
npx shadcn@latest add card button input badge
```

## Data

```ts
// content/landing/pricing.ts
export type Tier = {
  id: 'free' | 'pro' | 'team';
  name: string;
  audience: string;
  price: string;
  cadence: string;
  highlight: boolean;
  features: string[];
  cta: { label: string; href: string };
};

export const TIERS: Tier[] = [
  {
    id: 'free',
    name: 'Free',
    audience: 'For solo builders',
    price: 'EUR 0',
    cadence: 'forever',
    highlight: false,
    features: ['1 workspace', '1 user', '100 pages', 'Community support'],
    cta: { label: 'Get started', href: '/auth' },
  },
  {
    id: 'pro',
    name: 'Pro',
    audience: 'For power users',
    price: 'EUR 12',
    cadence: 'per month',
    highlight: true,
    features: ['Unlimited workspaces', '5 users', 'Unlimited pages', 'Priority support', 'API access'],
    cta: { label: 'Start free trial', href: '/auth' },
  },
  {
    id: 'team',
    name: 'Team',
    audience: 'For growing teams',
    price: 'EUR 49',
    cadence: 'per month',
    highlight: false,
    features: ['Everything in Pro', 'Unlimited users', 'SSO', 'Audit logs', 'Dedicated support'],
    cta: { label: 'Contact sales', href: 'mailto:sales@example.com' },
  },
];
```

## Component

```tsx
// components/landing/pricing.tsx
import Link from 'next/link';
import { Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { TIERS, type Tier } from '@/content/landing/pricing';
import { cn } from '@/lib/utils';
import { Container } from './container';
import { Waitlist } from './waitlist';

export function Pricing() {
  return (
    <section id="pricing" className="py-16 md:py-24">
      <Container>
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start free. Upgrade when you grow.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
          {TIERS.map((tier) => (
            <TierCard key={tier.id} tier={tier} />
          ))}
        </div>

        <div className="mx-auto mt-12 max-w-md text-center">
          <Waitlist />
        </div>
      </Container>
    </section>
  );
}

function TierCard({ tier }: { tier: Tier }) {
  return (
    <div className="relative">
      {tier.highlight && (
        <Badge className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
          Popular
        </Badge>
      )}
      <Card className={cn(tier.highlight && 'border-primary shadow-sm')}>
        <CardHeader>
          <h3 className="text-lg font-semibold">{tier.name}</h3>
          <p className="text-sm text-muted-foreground">{tier.audience}</p>
          <p className="mt-4">
            <span className="text-3xl font-semibold tracking-tight">{tier.price}</span>
            <span className="ml-1 text-sm text-muted-foreground">{tier.cadence}</span>
          </p>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {tier.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <Button
            render={<Link href={tier.cta.href} />}
            nativeButton={false}
            variant={tier.highlight ? 'default' : 'outline'}
            className="mt-6 w-full"
          >
            {tier.cta.label}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

## Notes

- `Pricing` is a server component. It imports `Waitlist` (a client component) and renders it below the cards. Only the form opts into `"use client"`.
- `TierCard` takes a `tier` prop because it is a pure presentational sub-component, not a top-level section. Top-level sections still take no props.
- The highlighted tier gets `border-primary` and a `Popular` badge. The badge is positioned on a wrapper `<div className="relative">` around the `Card`, not on the `Card` itself, because the shadcn `Card` has `overflow-hidden` which would clip an absolutely positioned child.
- `Button render={<Link />}` with `nativeButton={false}` lets the CTA be a `Link` while keeping button styles. This is the base-ui pattern (replaces the Radix `asChild` prop).
- If you do not want a waitlist, drop the `<Waitlist />` import and render. The section stays a server component with no client boundary.
