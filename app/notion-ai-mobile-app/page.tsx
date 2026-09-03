import { SeoPage } from "@/components/seo/seo-page";
import { AppJsonLd, FaqJsonLd } from "@/components/seo/json-ld";
import { NOTION_AI_MOBILE_APP } from "@/content/seo/notion-ai-mobile-app";
import { SITE_URL } from "@/content/seo/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: NOTION_AI_MOBILE_APP.title,
    description: NOTION_AI_MOBILE_APP.description,
    alternates: {
        canonical: "/notion-ai-mobile-app",
    },
    openGraph: {
        title: NOTION_AI_MOBILE_APP.title,
        description: NOTION_AI_MOBILE_APP.description,
        url: `${SITE_URL}/notion-ai-mobile-app`,
        siteName: "Any AI for Notion",
        type: "website",
    },
};

export default function NotionAiMobileAppPage() {
    return (
        <>
            <FaqJsonLd faqs={NOTION_AI_MOBILE_APP.faqs} />
            <AppJsonLd />
            <SeoPage page={NOTION_AI_MOBILE_APP} />
        </>
    );
}