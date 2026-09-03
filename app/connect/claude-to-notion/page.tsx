import { SeoPage } from "@/components/seo/seo-page";
import { AppJsonLd, FaqJsonLd } from "@/components/seo/json-ld";
import { CLAUDE_TO_NOTION } from "@/content/seo/claude-to-notion";
import { SITE_URL } from "@/content/seo/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: CLAUDE_TO_NOTION.title,
    description: CLAUDE_TO_NOTION.description,
    alternates: {
        canonical: "/connect/claude-to-notion",
    },
    openGraph: {
        title: CLAUDE_TO_NOTION.title,
        description: CLAUDE_TO_NOTION.description,
        url: `${SITE_URL}/connect/claude-to-notion`,
        siteName: "Any AI for Notion",
        type: "website",
    },
};

export default function ConnectClaudeToNotionPage() {
    return (
        <>
            <FaqJsonLd faqs={CLAUDE_TO_NOTION.faqs} />
            <AppJsonLd />
            <SeoPage page={CLAUDE_TO_NOTION} />
        </>
    );
}