import { SeoPage } from "@/components/seo/seo-page";
import { AppJsonLd, FaqJsonLd } from "@/components/seo/json-ld";
import { NOTION_AI_LIFETIME } from "@/content/seo/notion-ai-lifetime";
import { SITE_URL } from "@/content/seo/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: NOTION_AI_LIFETIME.title,
    description: NOTION_AI_LIFETIME.description,
    alternates: {
        canonical: "/notion-ai-lifetime",
    },
    openGraph: {
        title: NOTION_AI_LIFETIME.title,
        description: NOTION_AI_LIFETIME.description,
        url: `${SITE_URL}/notion-ai-lifetime`,
        siteName: "Any AI for Notion",
        type: "website",
    },
};

export default function NotionAiLifetimePage() {
    return (
        <>
            <FaqJsonLd faqs={NOTION_AI_LIFETIME.faqs} />
            <AppJsonLd />
            <SeoPage page={NOTION_AI_LIFETIME} />
        </>
    );
}