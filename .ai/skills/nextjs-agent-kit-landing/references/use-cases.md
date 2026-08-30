# Use cases

Expandable scenario cards. Client component because it tracks which card is open. One open at a time (accordion behavior).

```tsx
// components/landing/use-cases.tsx
'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Container } from './container';

type Scenario = { who: 'you' | 'app'; text: string };
type UseCase = {
  id: string;
  title: string;
  description: string;
  scenario: Scenario[];
};

const USE_CASES: UseCase[] = [
  {
    id: 'onboarding',
    title: 'Onboarding a new client',
    description: 'Set up a project space in minutes.',
    scenario: [
      { who: 'you', text: 'Start a project for Acme Corp.' },
      { who: 'app', text: 'Created the Acme space, linked the GitHub repo, and drafted a welcome page.' },
      { who: 'you', text: 'Add the team.' },
      { who: 'app', text: 'Invited all members and set their access levels.' },
    ],
  },
  {
    id: 'handoff',
    title: 'Handing off work',
    description: 'Capture context before someone goes on leave.',
    scenario: [
      { who: 'you', text: 'I am going on vacation next week.' },
      { who: 'app', text: 'I summarized the open threads and assigned owners to each.' },
    ],
  },
];

export function UseCases() {
  const [openId, setOpenId] = useState<string | null>(USE_CASES[0]?.id ?? null);

  return (
    <section id="use-cases" className="py-16 md:py-24">
      <Container>
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Use cases
          </h2>
        </div>
        <div className="mx-auto max-w-3xl space-y-3">
          {USE_CASES.map((useCase) => {
            const isOpen = openId === useCase.id;
            return (
              <div key={useCase.id} className="rounded-lg border border-border bg-card">
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : useCase.id)}
                  className="flex w-full items-center justify-between px-4 py-4 text-left"
                >
                  <span className="flex flex-col gap-1">
                    <span className="font-medium">{useCase.title}</span>
                    <span className="text-sm text-muted-foreground">{useCase.description}</span>
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isOpen && (
                  <div className="border-t border-border px-4 py-4">
                    <div className="space-y-2">
                      {useCase.scenario.map((turn, index) => (
                        <div
                          key={index}
                          className={`rounded-md px-3 py-2 text-sm ${
                            turn.who === 'you' ? 'bg-muted text-foreground' : 'bg-primary/10 text-foreground'
                          }`}
                        >
                          {turn.text}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
```

## Notes

- The open/close toggle uses `setOpenId(isOpen ? null : useCase.id)`, not a ternary rendering different trees. The ternary here only picks the next id, which is allowed. If you prefer, split into an `if/else` inside the handler.
- `ChevronDown` rotates via a conditional class appended to the base. For complex conditionals use `cn()`.
- `USE_CASES` is co-located. It is section-only data.
- The first card opens by default (`USE_CASES[0]?.id`). Change to `null` if you want all closed initially.
