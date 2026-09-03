import { SeoPage } from "@/components/seo/seo-page";
import { AppJsonLd, FaqJsonLd } from "@/components/seo/json-ld";
import {
    VS_NOTION_MCP,
    VS_NOTION_MCP_COMPARISON,
} from "@/content/seo/vs-notion-mcp";
import { SITE_URL } from "@/content/seo/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: VS_NOTION_MCP.title,
    description: VS_NOTION_MCP.description,
    alternates: {
        canonical: "/vs/notion-mcp",
    },
    openGraph: {
        title: VS_NOTION_MCP.title,
        description: VS_NOTION_MCP.description,
        url: `${SITE_URL}/vs/notion-mcp`,
        siteName: "Any AI for Notion",
        type: "website",
    },
};

export default function VsNotionMcpPage() {
    return (
        <>
            <FaqJsonLd faqs={VS_NOTION_MCP.faqs} />
            <AppJsonLd />
            <SeoPage page={VS_NOTION_MCP} comparison={VS_NOTION_MCP_COMPARISON} />
        </>
    );
}