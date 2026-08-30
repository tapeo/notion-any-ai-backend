# FAQ

shadcn Accordion driven by the shared data array. Server component. The same data feeds the FAQPage JSON-LD in `app/page.tsx`.

Add the primitive:

```bash
npx shadcn@latest add accordion
```

## Data

```ts
// content/landing/faqs.ts
export type Faq = { id: string; question: string; answer: string };

export const FAQS: Faq[] = [
  {
    id: 'vs-notion',
    question: 'How is this different from Notion?',
    answer: 'Notion is a blank page. This app writes the pages for you, then keeps them current as your code and conversations change.',
  },
  {
    id: 'data-ownership',
    question: 'Who owns my data?',
    answer: 'You do. Export everything as markdown anytime. No lock-in.',
  },
  {
    id: 'self-host',
    question: 'Can I self-host?',
    answer: 'Yes. The kit ships a Dockerfile and a docker-compose setup. Run it on any container host.',
  },
];
```

## Component

```tsx
// components/landing/faq.tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { FAQS } from '@/content/landing/faqs';
import { Container } from './container';

export function Faq() {
  return (
    <section id="faq" className="py-16 md:py-24">
      <Container>
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-center text-3xl font-semibold tracking-tight md:text-4xl">
            Frequently asked questions
          </h2>
          <Accordion type="multiple">
            {FAQS.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Container>
    </section>
  );
}
```

## Notes

- `type="multiple"` lets several items stay open at once. Use `type="single"` for accordion behavior (one open at a time).
- `max-w-3xl` keeps the accordion readable. Wider makes the rows too long.
- The `FAQS` array is imported here and in `app/page.tsx` for the JSON-LD. One source of truth, see `references/data.md`.
- Answers are plain text. If you need links inside an answer, render the `AccordionContent` with JSX instead of a string.
