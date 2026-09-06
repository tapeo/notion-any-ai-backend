import type { MetadataRoute } from "next";

const SITE_URL = "https://anyaifornotion.com";

type SitemapEntry = {
    path: string;
    priority: number;
};

const PAGES: SitemapEntry[] = [
    { path: "/", priority: 1 },
    { path: "/notion-ai-alternative", priority: 0.9 },
    { path: "/notion-byok", priority: 0.9 },
    { path: "/connect/chatgpt-to-notion", priority: 0.9 },
    { path: "/vs/notion-ai", priority: 0.8 },
    { path: "/vs/notion-mcp", priority: 0.8 },
    { path: "/connect/claude-to-notion", priority: 0.8 },
    { path: "/notion-claude", priority: 0.8 },
    { path: "/connect/gemini-to-notion", priority: 0.8 },
    { path: "/connect/local-llm-to-notion", priority: 0.8 },
    { path: "/chat-with-notion", priority: 0.8 },
    { path: "/notion-ai-mobile-app", priority: 0.8 },
    { path: "/notion-ai-lifetime", priority: 0.7 },
    { path: "/open-source-notion-ai", priority: 0.7 },
];

export default function sitemap(): MetadataRoute.Sitemap {
    return PAGES.map((page) => ({
        url: `${SITE_URL}${page.path}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: page.priority,
    }));
}