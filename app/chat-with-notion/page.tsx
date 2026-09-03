import { SeoPage } from "@/components/seo/seo-page";
import { AppJsonLd, FaqJsonLd } from "@/components/seo/json-ld";
import { CHAT_WITH_NOTION } from "@/content/seo/chat-with-notion";
import { SITE_URL } from "@/content/seo/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: CHAT_WITH_NOTION.title,
    description: CHAT_WITH_NOTION.description,
    alternates: {
        canonical: "/chat-with-notion",
    },
    openGraph: {
        title: CHAT_WITH_NOTION.title,
        description: CHAT_WITH_NOTION.description,
        url: `${SITE_URL}/chat-with-notion`,
        siteName: "Any AI for Notion",
        type: "website",
    },
};

export default function ChatWithNotionPage() {
    return (
        <>
            <FaqJsonLd faqs={CHAT_WITH_NOTION.faqs} />
            <AppJsonLd />
            <SeoPage page={CHAT_WITH_NOTION} />
        </>
    );
}