import type { SeoFaq, SeoPageContent } from "./types";

export const CHATGPT_TO_NOTION: SeoPageContent = {
    slug: "connect-chatgpt-to-notion",
    title: "How to connect ChatGPT to Notion (read and write) | Any AI for Notion",
    description:
        "Connect ChatGPT models like GPT-4o to your Notion workspace in minutes. Search, read, create, and update pages and databases from your own API key, on mobile or desktop.",
    heroBadge: "ChatGPT + Notion integration",
    h1: "Connect ChatGPT to Notion, with full read and write access",
    heroSubtext:
        "Read your notes, draft articles, and update project databases directly with GPT-4o and other OpenAI models, using your own API key.",
    sections: [
        {
            id: "steps",
            title: "How to connect ChatGPT to Notion in 3 steps",
            bullets: [
                "Step 1: install Any AI for Notion and connect your workspace through Notion's official OAuth. You pick exactly which pages the assistant can access.",
                "Step 2: add your OpenAI API key, or an OpenRouter key if you route GPT models through it. The key stays on your device.",
                "Step 3: start chatting. Ask the assistant to search databases, summarize pages, draft content, and create or update pages.",
            ],
        },
        {
            id: "use-cases",
            title: "What you can do with ChatGPT in Notion",
            bullets: [
                "Summarize long meeting notes and append action items straight to your task board.",
                "Generate blog drafts and push them into your content calendar as new pages.",
                "Ask questions across complex databases, like which projects are overdue, without opening Notion.",
                "Rewrite, translate, or restructure an existing page and save the result in place.",
            ],
        },
        {
            id: "how-it-works",
            title: "How the integration works under the hood",
            paragraphs: [
                "The app turns your chat into tool calls against Notion's official REST API. When you ask for something, the model decides whether to search, read, create, or update, and the app performs those calls with your OAuth token. You see every change in your workspace, and you can revoke access at any time from Notion's settings.",
                "Your OpenAI key and Notion token stay on your device in platform-native secure storage. The open source backend is a stateless proxy and stores no credentials.",
            ],
        },
        {
            id: "mobile",
            title: "ChatGPT in your pocket",
            paragraphs: [
                "The iOS app puts the same ChatGPT-powered assistant on your phone, with voice input for capturing ideas on the go and on-device reminders that fire even when the app is closed.",
            ],
        },
    ],
    faqs: [
        {
            id: "needs-api-key",
            question: "Do I need a ChatGPT Plus subscription?",
            answer:
                "No. The app talks to OpenAI's API with your own API key, which is billed separately from ChatGPT Plus. You create a key at platform.openai.com and pay only for the tokens you use.",
        },
        {
            id: "write-support",
            question: "Can ChatGPT write back to Notion, or only read?",
            answer:
                "Both. The assistant can search your workspace, read pages and databases, create new pages, and update existing ones through Notion's official API. You authorize the pages, and you can revoke access at any time.",
        },
        {
            id: "data-storage",
            question: "Does ChatGPT store my Notion data?",
            answer:
                "Page content you send goes to OpenAI as part of the prompt, under your API account and its data policies. Your Notion token and API key never leave your device, and the open source proxy backend keeps no records.",
        },
        {
            id: "gpt-models",
            question: "Which OpenAI models are supported?",
            answer:
                "Any model on the OpenAI API, including GPT-4o and newer releases, plus OpenAI-compatible endpoints like OpenRouter if you prefer a single key for many providers.",
        },
        {
            id: "mobile-app",
            question: "Is there a mobile app for ChatGPT and Notion?",
            answer:
                "Yes. Any AI for Notion is on the iOS App Store, so you can chat with your workspace, capture voice notes, and get reminders on your phone.",
        },
    ],
    ctaLabel: "Connect ChatGPT to your Notion workspace",
};

export const CHATGPT_TO_NOTION_FAQS: SeoFaq[] = CHATGPT_TO_NOTION.faqs;