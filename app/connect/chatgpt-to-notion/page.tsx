import { SeoPage } from "@/components/seo/seo-page";
import { AppJsonLd, FaqJsonLd } from "@/components/seo/json-ld";
import { CHATGPT_TO_NOTION } from "@/content/seo/chatgpt-to-notion";
import { SITE_URL } from "@/content/seo/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: CHATGPT_TO_NOTION.title,
    description: CHATGPT_TO_NOTION.description,
    alternates: {
        canonical: "/connect/chatgpt-to-notion",
    },
    openGraph: {
        title: CHATGPT_TO_NOTION.title,
        description: CHATGPT_TO_NOTION.description,
        url: `${SITE_URL}/connect/chatgpt-to-notion`,
        siteName: "Any AI for Notion",
        type: "website",
    },
};

export default function ConnectChatgptToNotionPage() {
    return (
        <>
            <FaqJsonLd faqs={CHATGPT_TO_NOTION.faqs} />
            <AppJsonLd />
            <SeoPage page={CHATGPT_TO_NOTION} />
        </>
    );
}