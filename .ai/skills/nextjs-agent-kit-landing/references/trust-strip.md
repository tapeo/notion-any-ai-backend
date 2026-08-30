# Trust strip

A row of wordmarks or names. Server component. Shows what the product works with or who uses it.

```tsx
// components/landing/trust-strip.tsx
import { Container } from './container';

const AGENTS: string[] = ['Cursor', 'Devin', 'Copilot', 'Claude', 'Amp', 'Codex', 'Gemini'];

export function TrustStrip() {
  return (
    <section id="works-with" className="py-12">
      <Container>
        <div className="flex flex-col items-center gap-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Works with
          </p>
          <div className="flex w-full flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {AGENTS.map((agent) => (
              <span key={agent} className="text-lg font-medium tracking-tight text-muted-foreground">
                {agent}
              </span>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
```

## Notes

- Wordmarks are plain text here. If you have logo images, use `next/image` with a grayscale filter and a hover color restore.
- `tracking-[0.2em]` on the eyebrow is the wide-letter-spaced label style. Adjust per design.
- Keep the list to 5 to 8 items. More than that wraps awkwardly.
- `AGENTS` is co-located. It is section-only data.
