import { SeoPage } from "@/components/seo/seo-page";
import { AppJsonLd, FaqJsonLd } from "@/components/seo/json-ld";
import { NOTION_CLAUDE } from "@/content/seo/notion-claude";
import { SITE_URL } from "@/content/seo/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: NOTION_CLAUDE.title,
    description: NOTION_CLAUDE.description,
    alternates: {
        canonical: "/notion-claude",
    },
    openGraph: {
        title: NOTION_CLAUDE.title,
        description: NOTION_CLAUDE.description,
        url: `${SITE_URL}/notion-claude`,
        siteName: "Any AI for Notion",
        type: "website",
    },
};

export default function NotionClaudePage() {
    return (
        <>
            <FaqJsonLd faqs={NOTION_CLAUDE.faqs} />
            <AppJsonLd />
            <SeoPage page={NOTION_CLAUDE} />
        </>
    );
}