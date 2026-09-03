import type { SeoPageContent } from "./types";

export const GEMINI_TO_NOTION: SeoPageContent = {
    slug: "connect-gemini-to-notion",
    title: "Connect Google Gemini to Notion: full workspace access | Any AI for Notion",
    description:
        "Bring Google Gemini into your Notion workspace. Large context windows for long documents, fast responses, and full read and write access through the official Notion API.",
    heroBadge: "Gemini + Notion integration",
    h1: "Connect Google Gemini to Notion",
    heroSubtext:
        "Bring the speed and large context windows of Gemini into your Notion workspace, and read and write pages with your own key.",
    sections: [
        {
            id: "why",
            title: "Why use Gemini for Notion",
            bullets: [
                "Large context windows let the assistant process big wiki archives and long meeting transcripts in a single query.",
                "Fast response times make database lookups and quick searches feel instant.",
                "Competitive token pricing through Google's API or OpenRouter.",
            ],
        },
        {
            id: "steps",
            title: "How to configure it in 2 minutes",
            bullets: [
                "Step 1: install Any AI for Notion and connect your workspace through Notion's official OAuth.",
                "Step 2: pick a Gemini endpoint through Google's API or OpenRouter, and enter your key.",
                "Step 3: start querying on mobile or desktop. The assistant can search, read, create, and update pages.",
            ],
        },
        {
            id: "use-cases",
            title: "What Gemini is good at in Notion",
            bullets: [
                "Summarizing an entire archive of pages in one query, thanks to the large context window.",
                "Rapid database lookups, like pulling overdue projects or this week's tasks.",
                "Drafting structured content from your own material, such as turning raw notes into a brief.",
            ],
        },
        {
            id: "security",
            title: "Security and token handling",
            paragraphs: [
                "Your API key and Notion token stay on your device in platform-native secure storage. The open source backend is a stateless proxy that stores no credentials, and you can revoke Notion access at any time.",
            ],
        },
    ],
    faqs: [
        {
            id: "which-models",
            question: "Which Gemini models are supported?",
            answer:
                "Any Gemini model exposed through an OpenAI-compatible endpoint, including Google's API via a compatibility layer and OpenRouter. Pick the model in the app settings and switch any time.",
        },
        {
            id: "free-tier",
            question: "Can I use Gemini's free tier?",
            answer:
                "If your endpoint and key allow it, yes. The app works with any OpenAI-compatible endpoint you configure, including Google's free tier limits where available. Usage is billed by Google, not by us.",
        },
        {
            id: "write-support",
            question: "Can Gemini write to Notion pages?",
            answer:
                "Yes. The assistant has full read and write tool access through Notion's official API: search, read, create pages, update pages, and append blocks.",
        },
        {
            id: "mobile",
            question: "Does this work on mobile?",
            answer:
                "Yes. Any AI for Notion is on the iOS App Store, with the same workspace access, voice input, and reminders as on desktop builds.",
        },
    ],
    ctaLabel: "Connect Gemini to Notion",
};