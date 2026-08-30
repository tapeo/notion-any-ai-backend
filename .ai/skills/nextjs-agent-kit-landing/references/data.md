# Data and JSON-LD

How shared data flows into sections and structured data. The same typed arrays feed both the section components and the JSON-LD scripts.

## Data location

- `content/landing/*.ts` holds shared cross-section data as typed exported arrays. Anything reused by two consumers (a section + JSON-LD, or two sections) lives here.
- Section-only copy is a `const` array at the top of the section file.
- One-off prose is inline JSX.

Create `content/landing/` and add files as needed. The three most common:

```ts
// content/landing/faqs.ts
export type Faq = { id: string; question: string; answer: string };
export const FAQS: Faq[] = [ /* ... */ ];

// content/landing/pricing.ts
export type Tier = { /* ... */ };
export const TIERS: Tier[] = [ /* ... */ ];

// content/landing/testimonials.ts
export type Testimonial = { /* ... */ };
export const TESTIMONIALS: Testimonial[] = [ /* ... */ ];
```

Do not create a data file for content used by only one section. Co-locate it.

## JSON-LD

Structured data for search engines. Built from the same arrays the sections use. Injected in `app/page.tsx` as `<script type="application/ld+json">` with `dangerouslySetInnerHTML`. See `references/page-assembly.md` for the full injection.

### FAQPage

Maps over `FAQS` from `content/landing/faqs.ts`:

```tsx
import { FAQS } from '@/content/landing/faqs';

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
};
```

### SoftwareApplication

Reads the price from the pricing data:

```tsx
import { TIERS } from '@/content/landing/pricing';

const appJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'My app',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: TIERS.map((tier) => ({
    '@type': 'Offer',
    name: tier.name,
    price: tier.price.replace(/[^\d.]/g, ''),
    priceCurrency: 'EUR',
    description: tier.features.join(', '),
  })),
};
```

Strip non-numeric characters from the price string before putting it in `price`. Schema.org expects a number. Set `priceCurrency` to the ISO code you actually charge in.

### Organization

Use if the landing page represents a company, not just a product:

```tsx
const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Your company',
  url: 'https://example.com',
  logo: 'https://example.com/logo.webp',
};
```

### WebSite

Helps with sitelinks search box:

```tsx
const siteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  url: 'https://example.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://example.com/search?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};
```

Only add the SearchAction if you actually have a search page.
