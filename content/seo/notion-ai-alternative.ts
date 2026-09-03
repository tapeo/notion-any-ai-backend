import type { SeoPageContent } from "./types";

export const NOTION_AI_ALTERNATIVE: SeoPageContent = {
    slug: "notion-ai-alternative",
    title:
        "Best Notion AI alternative (no subscription, use any model) | Any AI for Notion",
    description:
        "Any AI for Notion is an open source, pay-once Notion AI alternative. Bring your own ChatGPT, Claude, Gemini, or local model, and read and write your workspace from any device.",
    heroBadge: "Open source Notion AI alternative",
    h1: "The open source, pay once Notion AI alternative",
    heroSubtext:
        "Connect ChatGPT, Claude, Gemini, or a local model directly to your Notion workspace. Full read and write access, no monthly per seat fees.",
    sections: [
        {
            id: "problem",
            title: "The problem with Notion AI",
            bullets: [
                "Notion AI costs $10 per user per month as an add-on, or pushes you to Business plans at $24+ per user per month.",
                "You cannot choose the model. You get whatever Notion routes your requests to, with no way to pick GPT-4o, Claude, Gemini, or a custom model.",
                "Usage is metered, with limits that tighten during peak work hours.",
                "Your workspace content is processed entirely inside Notion's stack. There is no bring your own key option.",
            ],
        },
        {
            id: "solution",
            title: "The Any AI for Notion solution",
            paragraphs: [
                "Any AI for Notion is an app that connects any OpenAI-compatible model to your workspace through Notion's official OAuth. You bring your own key, so you pay the raw token price of the model you pick, not a marked-up seat fee.",
            ],
            bullets: [
                "Bring your own key: use your personal OpenAI, Anthropic, OpenRouter, or Groq key, or point the app at a local Ollama endpoint.",
                "Full workspace access: search pages, read content, create new pages, and edit existing ones, not just a sidebar chat.",
                "One-time purchase of $8.99. No subscription, no seat minimums, no usage caps from us.",
                "iOS app on the App Store today, Linux snap build, and builds for every platform from the open source repo.",
                "Built-in tools beyond chat: on-device reminders, persistent memory across conversations, and voice input.",
            ],
        },
        {
            id: "how-it-works",
            title: "How it works",
            paragraphs: [
                "Connect your Notion workspace through Notion's official OAuth, choose an AI provider by entering your API key or endpoint, and start chatting. The app calls Notion's REST API on your behalf, so the assistant can search, read, and write the pages you authorize.",
            ],
        },
    ],
    faqs: [
        {
            id: "cheaper",
            question: "Is Any AI for Notion cheaper than Notion AI?",
            answer:
                "Over time, usually yes. Notion AI costs $10 per user per month, which is $120 per year per seat. Any AI for Notion is a one-time purchase of $8.99, and you pay your AI provider directly at raw token prices. For light or moderate usage, that is often cents per month.",
        },
        {
            id: "models",
            question: "Which models can I use?",
            answer:
                "Any model with an OpenAI-compatible endpoint. That includes OpenAI GPT models, Claude through OpenRouter, Gemini, DeepSeek, Groq, Mistral, Together AI, and local models through Ollama or LM Studio.",
        },
        {
            id: "read-write",
            question: "Can it actually write to my Notion pages?",
            answer:
                "Yes. The assistant can search your workspace, read page content, create new pages, and update existing ones through Notion's official API. You grant access per page and can revoke it at any time from your Notion settings.",
        },
        {
            id: "open-source",
            question: "Is it really open source?",
            answer:
                "Yes. The full source code is available on GitHub under GPLv3. You can inspect exactly how your Notion token and API keys are handled, or build the app yourself from source.",
        },
        {
            id: "platforms",
            question: "Which platforms does it run on?",
            answer:
                "The iOS app is on the App Store. A Linux build is available via snap, and the open source repo builds for Android, macOS, Windows, and Linux from the same codebase.",
        },
    ],
    ctaLabel: "Replace Notion AI today",
};