import { SeoPage } from "@/components/seo/seo-page";
import { AppJsonLd, FaqJsonLd } from "@/components/seo/json-ld";
import { OPEN_SOURCE_NOTION_AI } from "@/content/seo/open-source-notion-ai";
import { SITE_URL } from "@/content/seo/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: OPEN_SOURCE_NOTION_AI.title,
    description: OPEN_SOURCE_NOTION_AI.description,
    alternates: {
        canonical: "/open-source-notion-ai",
    },
    openGraph: {
        title: OPEN_SOURCE_NOTION_AI.title,
        description: OPEN_SOURCE_NOTION_AI.description,
        url: `${SITE_URL}/open-source-notion-ai`,
        siteName: "Any AI for Notion",
        type: "website",
    },
};

export default function OpenSourceNotionAiPage() {
    return (
        <>
            <FaqJsonLd faqs={OPEN_SOURCE_NOTION_AI.faqs} />
            <AppJsonLd />
            <SeoPage page={OPEN_SOURCE_NOTION_AI} />
        </>
    );
}