export type Faq = { id: string; question: string; answer: string; link?: { href: string; label: string } };

export const FAQS: Faq[] = [
    {
        id: "what-is-it",
        question: "What is Any AI for Notion?",
        answer:
            "It is a mobile app that lets you connect any AI model to your Notion workspace. Your AI agent can read pages, create new content, and update existing pages through a secure proxy.",
    },
    {
        id: "which-ai-models",
        question: "Which AI models can I use?",
        answer:
            "Any AI agent that supports custom tools or MCP connections. This includes ChatGPT, Claude, Gemini, Cursor, Copilot, and others. If your AI can call an HTTP endpoint, it can talk to your Notion.",
    },
    {
        id: "is-it-safe",
        question: "Is my Notion data safe?",
        answer:
            "Yes. The app uses Notion's official OAuth, so you grant access with the same permissions Notion already provides. You can revoke access at any time from your Notion settings. The proxy only touches the pages and databases you authorize.",
    },
    {
        id: "do-i-need-a-paid-notion-account",
        question: "Do I need a paid Notion account?",
        answer:
            "No. Any Notion account works, including the free plan. You only need to be able to install integrations, which is available on all plans.",
    },
    {
        id: "one-time-price",
        question: "Why is it a one-time payment?",
        answer:
            "The app runs on your device and connects directly to Notion. There is no server-side infrastructure to maintain for your usage, so there is no recurring cost to pass on. You pay once and own it.",
    },
    {
        id: "open-source",
        question: "Is the app open source?",
        answer:
            "Yes. The full source code is available on GitHub. The app is paid, and your purchase supports ongoing development. It also gets you the convenient App Store install with automatic updates. You are free to inspect the code or build it yourself from source.",
        link: {
            href: "https://github.com/tapeo/notion-any-ai",
            label: "View the source code on GitHub",
        },
    },
    {
        id: "refund",
        question: "Can I get a refund?",
        answer:
            "Yes. If the app does not work for you, contact support within 14 days of purchase for a full refund.",
    },
];