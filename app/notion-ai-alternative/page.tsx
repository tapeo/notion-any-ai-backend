import { SeoPage } from "@/components/seo/seo-page";
import { AppJsonLd, FaqJsonLd } from "@/components/seo/json-ld";
import { NOTION_AI_ALTERNATIVE } from "@/content/seo/notion-ai-alternative";
import { SITE_URL } from "@/content/seo/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: NOTION_AI_ALTERNATIVE.title,
    description: NOTION_AI_ALTERNATIVE.description,
    alternates: {
        canonical: "/notion-ai-alternative",
    },
    openGraph: {
        title: NOTION_AI_ALTERNATIVE.title,
        description: NOTION_AI_ALTERNATIVE.description,
        url: `${SITE_URL}/notion-ai-alternative`,
        siteName: "Any AI for Notion",
        type: "website",
    },
};

export default function NotionAiAlternativePage() {
    return (
        <>
            <FaqJsonLd faqs={NOTION_AI_ALTERNATIVE.faqs} />
            <AppJsonLd />
            <SeoPage page={NOTION_AI_ALTERNATIVE} />
        </>
    );
}