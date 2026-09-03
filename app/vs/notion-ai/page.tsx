import { SeoPage } from "@/components/seo/seo-page";
import { AppJsonLd, FaqJsonLd } from "@/components/seo/json-ld";
import { VS_NOTION_AI, VS_NOTION_AI_COMPARISON } from "@/content/seo/vs-notion-ai";
import { SITE_URL } from "@/content/seo/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: VS_NOTION_AI.title,
    description: VS_NOTION_AI.description,
    alternates: {
        canonical: "/vs/notion-ai",
    },
    openGraph: {
        title: VS_NOTION_AI.title,
        description: VS_NOTION_AI.description,
        url: `${SITE_URL}/vs/notion-ai`,
        siteName: "Any AI for Notion",
        type: "website",
    },
};

export default function VsNotionAiPage() {
    return (
        <>
            <FaqJsonLd faqs={VS_NOTION_AI.faqs} />
            <AppJsonLd />
            <SeoPage page={VS_NOTION_AI} comparison={VS_NOTION_AI_COMPARISON} />
        </>
    );
}