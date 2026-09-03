export const SITE_URL = "https://anyaifornotion.com";
export const GITHUB_URL = "https://github.com/tapeo/notion-any-ai";
export const APP_STORE_URL =
    "https://apps.apple.com/us/app/any-ai-for-notion/id6789153536";

export type SeoFaq = {
    id: string;
    question: string;
    answer: string;
};

export type SeoSection = {
    id: string;
    title: string;
    paragraphs?: string[];
    bullets?: string[];
};

export type ComparisonRow = {
    feature: string;
    anyAi: boolean | string;
    other: boolean | string;
};

export type ComparisonTable = {
    otherLabel: string;
    rows: ComparisonRow[];
};

export type SeoPageContent = {
    slug: string;
    title: string;
    description: string;
    h1: string;
    heroSubtext: string;
    heroBadge?: string;
    sections: SeoSection[];
    faqs: SeoFaq[];
    ctaLabel: string;
};