import { Comparison } from "@/components/landing/comparison";
import { CTA } from "@/components/landing/cta";
import { Faq } from "@/components/landing/faq";
import { Features } from "@/components/landing/features";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { Nav } from "@/components/landing/nav";
import { Pricing } from "@/components/landing/pricing";
import { ProductPreview } from "@/components/landing/product-preview";
import { TrustStrip } from "@/components/landing/trust-strip";
import { FAQS } from "@/content/landing/faqs";
import { TIERS } from "@/content/landing/pricing";
import type { Metadata } from "next";

const SITE_URL = "https://anyaifornotion.com";

export const metadata: Metadata = {
    title: "Any AI for Notion, connect any AI model to your Notion workspace",
    description:
        "Use ChatGPT, Claude, Gemini, or any AI agent to read and write your Notion pages. Secure OAuth, mobile app, one-time purchase.",
    metadataBase: new URL(SITE_URL),
    openGraph: {
        title: "Any AI for Notion",
        description:
            "Connect any AI model to your Notion workspace. Read, create, and update pages from any AI agent.",
        url: SITE_URL,
        siteName: "Any AI for Notion",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Any AI for Notion",
        description:
            "Connect any AI model to your Notion workspace. Read, create, and update pages from any AI agent.",
    },
};

const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
};

const appJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Any AI for Notion",
    applicationCategory: "ProductivityApplication",
    operatingSystem: "iOS, Android",
    offers: TIERS.map((tier) => ({
        "@type": "Offer",
        name: tier.name,
        price: tier.price.replace(/[^\d.]/g, ""),
        priceCurrency: "USD",
        description: tier.features.join(", "),
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
            <main>
                <Hero />
                <ProductPreview />
                <Features />
                <TrustStrip />
                <Comparison />
                <Pricing />
                <Faq />
                <CTA />
            </main>
            <Footer />
        </>
    );
}