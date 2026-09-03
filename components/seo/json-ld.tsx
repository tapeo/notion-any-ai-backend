import { APP_STORE_URL, GITHUB_URL, type SeoFaq } from "@/content/seo/types";

function JsonLdScript({ data }: { data: object }) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}

export function FaqJsonLd({ faqs }: { faqs: SeoFaq[] }) {
    const data = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
    };
    return <JsonLdScript data={data} />;
}

export function AppJsonLd() {
    const data = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "Any AI for Notion",
        applicationCategory: "ProductivityApplication",
        operatingSystem: "iOS",
        offers: {
            "@type": "Offer",
            price: "8.99",
            priceCurrency: "USD",
            url: APP_STORE_URL,
        },
        sameAs: [GITHUB_URL],
    };
    return <JsonLdScript data={data} />;
}

export function BreadcrumbJsonLd({ path, name }: { path: string; name: string }) {
    const data = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            {
                "@type": "ListItem",
                position: 1,
                name: "Any AI for Notion",
                item: "https://anyaifornotion.com",
            },
            {
                "@type": "ListItem",
                position: 2,
                name,
                item: `https://anyaifornotion.com${path}`,
            },
        ],
    };
    return <JsonLdScript data={data} />;
}