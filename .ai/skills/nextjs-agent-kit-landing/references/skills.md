# Skills grid

Data-driven skill list. Server component. When the skills list is reused (e.g. for JSON-LD or another page), move it to `content/landing/skills.ts`.

## Shared data

```ts
// content/landing/skills.ts
export type Skill = { name: string; description: string };
export const SKILLS: Skill[] = [
  { name: 'TypeScript', description: 'Strict mode, no any, no escape hatches.' },
  { name: 'React 19', description: 'Server components, actions, use() hook.' },
  { name: 'Next.js 16', description: 'App Router, streaming, partial prerendering.' },
];
```

## Component

```tsx
// components/landing/skills.tsx
import { SKILLS } from '@/content/landing/skills';
import { Container } from './container';

export function Skills() {
  return (
    <section id="skills" className="py-16 md:py-24">
      <Container>
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-primary">
          Skills
        </p>
        <h2 className="mb-12 max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
          Built with a stack that scales
        </h2>
        <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {SKILLS.map((skill) => (
            <li key={skill.name} className="bg-card p-6">
              <h3 className="text-lg font-medium">{skill.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{skill.description}</p>
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
- If the skills list is only used here, co-locate it as a `const` in the component instead of a data file.
