import { SeoPage } from "@/components/seo/seo-page";
import { AppJsonLd, FaqJsonLd } from "@/components/seo/json-ld";
import { GEMINI_TO_NOTION } from "@/content/seo/gemini-to-notion";
import { SITE_URL } from "@/content/seo/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: GEMINI_TO_NOTION.title,
    description: GEMINI_TO_NOTION.description,
    alternates: {
        canonical: "/connect/gemini-to-notion",
    },
    openGraph: {
        title: GEMINI_TO_NOTION.title,
        description: GEMINI_TO_NOTION.description,
        url: `${SITE_URL}/connect/gemini-to-notion`,
        siteName: "Any AI for Notion",
        type: "website",
    },
};

export default function ConnectGeminiToNotionPage() {
    return (
        <>
            <FaqJsonLd faqs={GEMINI_TO_NOTION.faqs} />
            <AppJsonLd />
            <SeoPage page={GEMINI_TO_NOTION} />
        </>
    );
}