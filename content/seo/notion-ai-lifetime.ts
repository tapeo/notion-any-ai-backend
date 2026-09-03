import type { SeoPageContent } from "./types";

export const NOTION_AI_LIFETIME: SeoPageContent = {
    slug: "notion-ai-lifetime",
    title: "Notion AI lifetime deal: pay once, no monthly fee | Any AI for Notion",
    description:
        "Notion AI without the subscription. Buy Any AI for Notion once for $8.99, use any model with your own keys, and own it forever. Open source, with a 14-day money-back guarantee.",
    heroBadge: "One-time purchase",
    h1: "Notion AI without the subscription",
    heroSubtext:
        "Buy once, use forever. No recurring fees, no seat minimums, no price increases.",
    sections: [
        {
            id: "saas-fatigue",
            title: "Tired of SaaS subscriptions?",
            paragraphs: [
                "Recurring fees stack up quietly: $10 a month here, $20 a month there, and by year's end it is hundreds of dollars for tools you barely remember buying. Notion AI alone is $120 to $288+ per seat, every year.",
                "Any AI for Notion uses a clean software ownership model. You pay once for the app, and pay raw infrastructure costs directly to your chosen AI provider. If your usage drops, your AI spend drops with it. If you go local, it drops to zero.",
            ],
        },
        {
            id: "what-you-get",
            title: "What you get",
            bullets: [
                "Lifetime access to the app, including free future updates and improvements.",
                "Full workspace access: search, read, create, and update Notion pages and databases.",
                "Bring your own key for OpenAI, OpenRouter, Groq, local Ollama, and more.",
                "Built-in reminders, persistent memory, and voice input.",
                "Full source code access on GitHub under GPLv3.",
                "A 14-day money-back guarantee, no questions asked.",
            ],
        },
        {
            id: "math",
            title: "The lifetime math",
            paragraphs: [
                "Notion AI at $10 per month costs more in five weeks than Any AI for Notion costs once. Even adding typical API token spend of a few dollars per month, the one-time purchase pays for itself within the first couple of months of subscription pricing.",
            ],
        },
    ],
    faqs: [
        {
            id: "one-time",
            question: "Is it really a one-time payment?",
            answer:
                "Yes. $8.99 once, and the app is yours forever with all future updates included. There is no subscription, no seat fee, and no usage limit imposed by us.",
        },
        {
            id: "future-updates",
            question: "Are future updates included?",
            answer:
                "Yes. Updates ship free to the app you bought, and since the source is on GitHub you always have access to the code for the version you own.",
        },
        {
            id: "refund",
            question: "What if it does not work for me?",
            answer:
                "Contact support within 14 days of purchase for a full refund.",
        },
        {
            id: "why-cheap",
            question: "How can a one-time price be sustainable?",
            answer:
                "The app runs on your device and connects directly to Notion and your AI provider. There is no per-user server infrastructure to maintain, so there is no recurring cost to pass on.",
        },
    ],
    ctaLabel: "Get lifetime access",
};