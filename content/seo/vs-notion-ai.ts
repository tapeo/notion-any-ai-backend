import type { ComparisonRow, SeoPageContent } from "./types";

export const VS_NOTION_AI: SeoPageContent = {
    slug: "vs-notion-ai",
    title: "Any AI for Notion vs Notion AI: which should you choose? | Any AI for Notion",
    description:
        "Side by side comparison of Any AI for Notion and Notion AI: pricing, model choice, read and write access, voice input, and privacy. An honest breakdown to help you decide.",
    heroBadge: "Head to head comparison",
    h1: "Any AI for Notion vs Notion AI: which should you choose?",
    heroSubtext:
        "A side by side comparison of features, pricing, model choice, and privacy, so you can decide which fits how you work.",
    sections: [
        {
            id: "cost",
            title: "The cost breakdown",
            paragraphs: [
                "One year of Notion AI costs $120 per seat at the add-on price, and $288+ per seat if you upgrade to Business plans to get it bundled. For a five person team, that is $600 to $1,440 every year, forever.",
                "Any AI for Notion is a one-time purchase of $8.99 for the app, plus raw token costs paid directly to your AI provider. For most usage patterns that is pennies to a few dollars per month, and local models cost nothing per token.",
            ],
        },
        {
            id: "model-freedom",
            title: "Model freedom",
            paragraphs: [
                "Notion AI selects the models for you. You cannot pick GPT-4o for coding help, Claude for long form writing, or a fast model for quick lookups, and you cannot switch when a better model ships.",
                "Any AI for Notion lets you choose. Use GPT-4o, Claude through OpenRouter, Gemini, DeepSeek, Groq, Mistral, or a local Ollama model, and switch at any time from the app settings.",
            ],
        },
        {
            id: "workflow",
            title: "Mobile and voice workflow",
            paragraphs: [
                "Any AI for Notion includes native voice transcription and on-device reminders on iOS, so you can capture an idea on the go and get a push notification when a reminder fires, even with the app closed. The assistant also keeps a persistent memory file, so it remembers your preferences across conversations.",
            ],
        },
        {
            id: "privacy",
            title: "Data privacy",
            paragraphs: [
                "Any AI for Notion stores your Notion token and API keys on your device in platform-native secure storage. The open source backend is stateless and keeps no user records. With a local model, your prompts never leave your machine at all.",
            ],
        },
        {
            id: "when-notion-ai",
            title: "When Notion AI is the better pick",
            paragraphs: [
                "An honest assessment: if you run a large organization that needs Notion's enterprise compliance, SSO enforcement, centralized billing, and support contracts, Notion AI bundled into an Enterprise plan is the simpler choice. Paying per seat is the price of that administration.",
            ],
        },
        {
            id: "when-any-ai",
            title: "When Any AI for Notion is the better pick",
            bullets: [
                "You are a solo power user, developer, or consultant who wants to choose your models.",
                "You already pay for AI somewhere else and refuse to pay a markup for a locked model.",
                "You want a dedicated mobile assistant with voice input and reminders.",
                "You want zero recurring software costs and open source you can audit.",
            ],
        },
    ],
    faqs: [
        {
            id: "is-notion-ai-worth-it",
            question: "Is Notion AI worth it?",
            answer:
                "It depends on your usage. If you use it a few times a week, $10 per month may feel expensive for a fixed model with usage caps. If you rely on AI across your whole team daily inside Notion's enterprise stack, it may be worth it. For individuals who want model choice and lower cost, a BYOK app is usually the better deal.",
        },
        {
            id: "pricing-difference",
            question: "How does pricing compare?",
            answer:
                "Notion AI is $10 per user per month, or bundled in Business plans at $24+ per user per month. Any AI for Notion is $8.99 once, plus raw API token costs paid to the provider you choose. Light users typically spend under $2 per month on tokens.",
        },
        {
            id: "notion-ai-vs-chatgpt",
            question: "Why not just use ChatGPT separately?",
            answer:
                "You can, but ChatGPT alone cannot read or write your workspace. Any AI for Notion bridges the two: the model of your choice gets tool access to search, read, create, and update Notion pages through the official API.",
        },
        {
            id: "switching",
            question: "How hard is it to switch from Notion AI?",
            answer:
                "Minutes. Connect your workspace through OAuth, paste an API key, and start chatting. Nothing in your Notion workspace changes, and you can keep both side by side while you decide.",
        },
    ],
    ctaLabel: "Switch to Any AI for Notion",
};

export const VS_NOTION_AI_COMPARISON: { otherLabel: string; rows: ComparisonRow[] } = {
    otherLabel: "Notion AI",
    rows: [
        { feature: "Price model", anyAi: "$8.99 once", other: "$10 to $24+ per user per month" },
        { feature: "Choose your model", anyAi: true, other: false },
        { feature: "Bring your own API key", anyAi: true, other: false },
        { feature: "Read and write pages", anyAi: true, other: true },
        { feature: "Voice input", anyAi: true, other: false },
        { feature: "On-device reminders", anyAi: true, other: false },
        { feature: "Persistent memory", anyAi: true, other: false },
        { feature: "Local models (Ollama)", anyAi: true, other: false },
        { feature: "Open source", anyAi: true, other: false },
    ],
};