# How it works

Numbered steps with optional screenshots. Server component.

```tsx
// components/landing/how-it-works.tsx
import Image from 'next/image';
import { Container } from './container';

type Step = {
  number: string;
  title: string;
  description: string;
  screenshot: string;
};

const STEPS: Step[] = [
  {
    number: '01',
    title: 'Connect your tools',
    description: 'Link Slack, GitHub, and Linear. The agent reads the context it needs.',
    screenshot: '/steps/connect.webp',
  },
  {
    number: '02',
    title: 'Ask in plain language',
    description: 'Type a question in any channel. The agent answers and writes a wiki page.',
    screenshot: '/steps/ask.webp',
  },
  {
    number: '03',
    title: 'Stay in sync',
    description: 'When code ships or tickets close, the wiki updates itself automatically.',
    screenshot: '/steps/sync.webp',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-y border-border bg-primary/5 py-16 md:py-24">
      <Container>
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            How it works
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.number} className="flex flex-col gap-4">
              <span className="text-sm font-semibold text-primary">{step.number}</span>
              <h3 className="text-xl font-semibold">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
              <div className="overflow-hidden rounded-lg border border-border">
                <Image
                  src={step.screenshot}
                  alt={step.title}
                  width={400}
                  height={225}
                  className="h-auto w-full"
                />
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
```

## Light/dark screenshot pairs

For one image per theme, render both and toggle with the `dark` variant:

```tsx
<div className="overflow-hidden rounded-lg border border-border">
  <Image src={step.screenshot} alt={step.title} width={400} height={225} className="h-auto w-full dark:hidden" />
  <Image src={step.screenshotDark} alt={step.title} width={400} height={225} className="hidden h-auto w-full dark:block" />
</div>
```

Add `screenshotDark?: string` to the `Step` type when you need pairs.

## Notes

- The `bg-primary/5 border-y` band alternates with the default background of the surrounding sections.
- Step numbers are zero-padded strings (`'01'`, `'02'`), not numbers, to control formatting without a helper.
- `STEPS` is co-located. It is section-only data.
