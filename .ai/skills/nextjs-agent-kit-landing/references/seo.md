# SEO: sitemap, robots, alternate landing pages

## Sitemap

Static sitemap. Add routes as you build them.

```tsx
// app/sitemap.ts
import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://example.com', lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: 'https://example.com/pricing', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://example.com/faq', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];
}
```

Use `DateTime.fromISO()` if you want Luxon-managed dates. For a static sitemap, `new Date()` is fine since this runs at build time.

## Robots

```tsx
// app/robots.ts
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/app', '/api'] },
    sitemap: 'https://example.com/sitemap.xml',
  };
}
```

`disallow: ['/app', '/api']` keeps auth-gated routes and API handlers out of the index. The proxy already sets `robots: noindex` on auth-gated layouts, but the robots file is the second line of defense.

## Alternate SEO landing pages

For SEO-targeted alternate landing pages (e.g. `/notion-alternative`, `/for-consultants`), create one folder per route under `app/`. Reuse the helper section components, add a local `metadata` export and a `BreadcrumbList` JSON-LD.

```tsx
// app/notion-alternative/page.tsx
import type { Metadata } from 'next';
import { Nav } from '@/components/landing/nav';
import { Footer } from '@/components/landing/footer';
import { Faq } from '@/components/landing/faq';

export const metadata: Metadata = {
  title: 'Notion alternative',
  description: 'Why teams switch from Notion to My app.',
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://example.com' },
    { '@type': 'ListItem', position: 2, name: 'Notion alternative', item: 'https://example.com/notion-alternative' },
  ],
};

export default function NotionAlternativePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Nav />
      <main className="pt-16">
        {/* bespoke hero and sections for this route */}
      </main>
      <Footer />
    </>
  );
}
```

## Notes

- Each SEO page reuses `<Nav />` and `<Footer />` for consistency.
- Add a `BreadcrumbList` JSON-LD per route so search results show the path.
- Keep the route-specific copy in the route folder, not in `content/landing/`. Shared data (FAQs, pricing) is imported from `content/landing/`.
- Do not duplicate the main landing page sections wholesale. Give each SEO page a focused angle.
