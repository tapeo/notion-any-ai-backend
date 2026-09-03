import { SeoPage } from "@/components/seo/seo-page";
import { AppJsonLd, FaqJsonLd } from "@/components/seo/json-ld";
import { LOCAL_LLM_TO_NOTION } from "@/content/seo/local-llm-to-notion";
import { SITE_URL } from "@/content/seo/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: LOCAL_LLM_TO_NOTION.title,
    description: LOCAL_LLM_TO_NOTION.description,
    alternates: {
        canonical: "/connect/local-llm-to-notion",
    },
    openGraph: {
        title: LOCAL_LLM_TO_NOTION.title,
        description: LOCAL_LLM_TO_NOTION.description,
        url: `${SITE_URL}/connect/local-llm-to-notion`,
        siteName: "Any AI for Notion",
        type: "website",
    },
};

export default function ConnectLocalLlmToNotionPage() {
    return (
        <>
            <FaqJsonLd faqs={LOCAL_LLM_TO_NOTION.faqs} />
            <AppJsonLd />
            <SeoPage page={LOCAL_LLM_TO_NOTION} />
        </>
    );
}