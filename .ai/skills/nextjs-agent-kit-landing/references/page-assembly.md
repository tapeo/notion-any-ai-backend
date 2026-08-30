# Page assembly

How `app/page.tsx` composes everything. The page is a server component. It builds the JSON-LD objects from the shared data arrays, injects them as scripts, then stacks the sections.

## Full page

```tsx
// app/page.tsx
import type { Metadata } from 'next';
import { Nav } from '@/components/landing/nav';
import { Footer } from '@/components/landing/footer';
import { Hero } from '@/components/landing/hero';
import { ProductPreview } from '@/components/landing/product-preview';
import { Features } from '@/components/landing/features';
import { HowItWorks } from '@/components/landing/how-it-works';
import { Pricing } from '@/components/landing/pricing';
import { Faq } from '@/components/landing/faq';
import { CTA } from '@/components/landing/cta';
import { FAQS } from '@/content/landing/faqs';
import { TIERS } from '@/content/landing/pricing';

export const metadata: Metadata = {
  title: 'My app, the wiki that writes itself',
  description: 'Your team\'s conversations become a living knowledge base. No more stale docs.',
  metadataBase: new URL('https://example.com'),
  openGraph: {
    title: 'My app',
    description: 'The wiki that writes itself.',
    url: 'https://example.com',
    siteName: 'My app',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'My app',
    description: 'The wiki that writes itself.',
  },
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: { '@type': 'Answer', text: faq.answer },
  })),
};

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
  })),
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }}
      />
      <Nav />
      <main className="pt-16">
        <Hero />
        <ProductPreview />
        <Features />
        <HowItWorks />
        <Pricing />
        <CTA />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
```

## Notes

- JSON-LD scripts go at the top, before `<Nav />`. They render nothing.
- `<main className="pt-16">` offsets the fixed nav. If you set `scroll-padding-top` on `html` in `globals.css`, anchor links also clear the nav.
- Sections are stacked in reading order. Stripe alternating ones with `bg-primary/5` by setting that class in the section component itself, not in `page.tsx`.
- Do not wrap sections in extra `<div>`s. Each section component owns its `<section>` element.
- Set `metadataBase` so relative OG image paths resolve. If you have a dynamic OG image (see below), reference it in `openGraph.images`.

## Dynamic OG image

Next.js can generate an OG image at build or request time using `next/og`:

```tsx
// app/opengraph-image.tsx
import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'My app';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'black',
          color: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 64,
        }}
      >
        My app
        <div style={{ fontSize: 32, color: '#888' }}>The wiki that writes itself</div>
      </div>
    ),
    { ...size },
  );
}
```

This generates `/opengraph-image.png` automatically. Next.js auto-detects it for `openGraph.images`.
