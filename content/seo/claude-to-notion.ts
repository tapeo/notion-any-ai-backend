import type { SeoPageContent } from "./types";

export const CLAUDE_TO_NOTION: SeoPageContent = {
    slug: "connect-claude-to-notion",
    title: "Connect Claude to Notion: read and write your workspace | Any AI for Notion",
    description:
        "Use Claude with your Notion workspace on mobile and desktop. Claude analyzes, writes, and manages your Notion pages through the official API, with your own key.",
    heroBadge: "Claude + Notion integration",
    h1: "Connect Claude to Notion and put Anthropic AI in your workspace",
    heroSubtext:
        "Use Claude Sonnet or Haiku to analyze, write, and manage your Notion databases, on your phone or your desktop, with your own API key.",
    sections: [
        {
            id: "why",
            title: "Why Claude and Notion work well together",
            paragraphs: [
                "Claude excels at long form prose, careful editing, and structured analysis, which is exactly the kind of work most Notion pages hold. Drafting documentation, reviewing a roadmap, or rewriting a messy note into a clean structure are all strong Claude use cases.",
                "Connect Claude to Notion through OpenRouter or any Anthropic-compatible OpenAI-compatible endpoint, and the assistant gets tool access to search, read, create, and update your pages.",
            ],
        },
        {
            id: "steps",
            title: "How to set it up in 3 steps",
            bullets: [
                "Step 1: install Any AI for Notion and connect your workspace through Notion's official OAuth.",
                "Step 2: enter your OpenRouter key or Anthropic-compatible endpoint, and pick a Claude model such as Sonnet or Haiku.",
                "Step 3: start prompting. The assistant can query databases, draft pages, and edit existing content.",
            ],
        },
        {
            id: "prompts",
            title: "Prompts that work well",
            bullets: [
                "\"Find the sprint backlog in my engineering database and write the technical spec on a new page.\"",
                "\"Review my project roadmap and point out missing dependencies.\"",
                "\"Read this meeting note and rewrite it as a decision log with owners.\"",
                "\"Summarize every page in the Research database from the last month into a weekly digest page.\"",
            ],
        },
        {
            id: "security",
            title: "Security and token handling",
            paragraphs: [
                "Your API keys and Notion token stay on your device in platform-native secure storage. The open source backend is a stateless proxy that forwards requests to Notion's official API and stores no credentials.",
            ],
        },
    ],
    faqs: [
        {
            id: "which-models",
            question: "Which Claude models can I use?",
            answer:
                "Any Claude model available through your endpoint, including Sonnet and Haiku variants. OpenRouter gives you one key with access to the full Claude lineup and other providers.",
        },
        {
            id: "needs-claude-pro",
            question: "Do I need a Claude Pro subscription?",
            answer:
                "No. The app calls the API with your own key, billed per token by the provider. That is separate from the Claude consumer subscription, and you only pay for what you use.",
        },
        {
            id: "write-support",
            question: "Can Claude write to my Notion pages?",
            answer:
                "Yes. The assistant can create new pages, update existing ones, and append blocks, not just read. You authorize which pages it can access, and you can revoke access at any time from Notion's settings.",
        },
        {
            id: "mobile",
            question: "Can I use Claude with Notion on my phone?",
            answer:
                "Yes. Any AI for Notion is on the iOS App Store, so the same Claude-powered assistant runs on your phone with voice input and on-device reminders.",
        },
    ],
    ctaLabel: "Start using Claude with Notion",
};