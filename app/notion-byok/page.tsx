import { SeoPage } from "@/components/seo/seo-page";
import { AppJsonLd, FaqJsonLd } from "@/components/seo/json-ld";
import {
    NOTION_BYOK,
    NOTION_BYOK_COMPARISON,
} from "@/content/seo/notion-byok";
import { SITE_URL } from "@/content/seo/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: NOTION_BYOK.title,
    description: NOTION_BYOK.description,
    alternates: {
        canonical: "/notion-byok",
    },
    openGraph: {
        title: NOTION_BYOK.title,
        description: NOTION_BYOK.description,
        url: `${SITE_URL}/notion-byok`,
        siteName: "Any AI for Notion",
        type: "website",
    },
};

export default function NotionByokPage() {
    return (
        <>
            <FaqJsonLd faqs={NOTION_BYOK.faqs} />
            <AppJsonLd />
            <SeoPage page={NOTION_BYOK} comparison={NOTION_BYOK_COMPARISON} />
        </>
    );
}