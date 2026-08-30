# Problem / Solution

Two-column section: numbered problem list on the left, solution statement on the right. Server component. The wrapping `<section>` lives in the component, not in `page.tsx`.

```tsx
// components/landing/problem-solution.tsx
import { Container } from './container';

const PROBLEMS: string[] = [
  'Knowledge lives in chat threads no one searches.',
  'Docs go stale the day they are written.',
  'Onboarding means answering the same questions.',
  'Context is lost between projects and clients.',
];

export function ProblemSolution() {
  return (
    <section id="problem-solution" className="border-y border-border bg-primary/5 py-16 md:py-24">
      <Container>
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <h2 className="mb-8 text-3xl font-semibold tracking-tight md:text-4xl">
              The problem
            </h2>
            <ol className="space-y-4">
              {PROBLEMS.map((problem, index) => (
                <li key={index} className="flex gap-4">
                  <span className="text-sm font-semibold text-muted-foreground">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="text-muted-foreground">{problem}</span>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h2 className="mb-8 text-3xl font-semibold tracking-tight md:text-4xl">
              The solution
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              The agent watches your conversations, writes the wiki pages you would
              have written, and links them to the code and tickets they describe.
              When the context changes, the wiki changes with it.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
```

## Notes

- Step numbers are zero-padded with `String(index + 1).padStart(2, '0')` to get `'01'`, `'02'`, etc.
- `PROBLEMS` is co-located. The solution prose is one-off copy, hardcoded in JSX.
- The `bg-primary/5 border-y` band alternates with surrounding sections.
