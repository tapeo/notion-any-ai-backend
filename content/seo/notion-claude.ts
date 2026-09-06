import type { SeoPageContent } from "./types";

export const NOTION_CLAUDE: SeoPageContent = {
    slug: "notion-claude",
    title: "Notion Claude: use Claude with your Notion workspace | Any AI for Notion",
    description:
        "Notion Claude, explained: how to add Claude to your Notion workspace with full read and write access. Your own API key, any Claude model, mobile and desktop. One-time purchase, open source.",
    heroBadge: "Notion Claude integration",
    h1: "Notion Claude: put Claude inside your Notion workspace",
    heroSubtext:
        "Search 'Notion Claude' and you will not find a native integration. Any AI for Notion fills the gap: Claude reads, writes, and manages your Notion pages with your own API key, on mobile and desktop.",
    sections: [
        {
            id: "what-is",
            title: "What is Notion Claude?",
            paragraphs: [
                "Notion Claude is not an official product. Notion's built-in AI uses its own selected models behind a $10 per user per month add-on, and it does not let you choose Claude or bring your own Anthropic key.",
                "The phrase describes what Any AI for Notion delivers: Claude running against your Notion workspace with real tool access. The assistant can search your workspace, read pages and databases, create new pages, and edit existing ones, all through Notion's official API.",
            ],
        },
        {
            id: "steps",
            title: "How to set up Notion Claude in 3 steps",
            bullets: [
                "Step 1: install Any AI for Notion and connect your workspace through Notion's official OAuth.",
                "Step 2: enter your OpenRouter key or any Anthropic-compatible endpoint, and pick a Claude model such as Sonnet or Haiku.",
                "Step 3: start prompting. Claude can query databases, draft pages, and edit existing content.",
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
            id: "vs-notion-ai",
            title: "Notion Claude vs the Notion AI add-on",
            bullets: [
                "Model choice: pick any Claude model, from Haiku for speed to Sonnet for deep work, instead of whatever Notion routes your request to.",
                "Cost: pay raw token prices with your own key, typically pennies to a few dollars per month, instead of $10 per user per month for the add-on.",
                "Access: the same app also connects GPT, Gemini, DeepSeek, Groq, and local Ollama models, so you are not locked to one provider.",
                "Privacy: your API key and Notion token stay on your device in platform-native secure storage.",
            ],
        },
        {
            id: "security",
            title: "Security and token handling",
            paragraphs: [
                "Your API keys and Notion token stay on your device in platform-native secure storage. The open source backend is a stateless proxy that forwards requests to Notion's official API and stores no credentials. You authorize which pages Claude can access, and you can revoke access at any time from Notion's settings.",
            ],
        },
    ],
    faqs: [
        {
            id: "native-integration",
            question: "Does Notion have a native Claude integration?",
            answer:
                "No. Notion AI is powered by models Notion selects, and there is no official way to use Claude or your own Anthropic key inside Notion. Any AI for Notion provides the missing integration: Claude connected to your workspace with full read and write access.",
        },
        {
            id: "can-i-add-claude",
            question: "Can I add Claude to Notion?",
            answer:
                "Yes. Install Any AI for Notion, connect your workspace through Notion's official OAuth, and enter your OpenRouter key or an Anthropic-compatible endpoint. Claude can then search, read, create, and update your Notion pages.",
        },
        {
            id: "which-models",
            question: "Which Claude models can I use?",
            answer:
                "Any Claude model available through your endpoint, including Sonnet and Haiku variants. OpenRouter gives you one key with access to the full Claude lineup and other providers like GPT and Gemini.",
        },
        {
            id: "claude-pro",
            question: "Do I need a Claude Pro subscription?",
            answer:
                "No. The app calls the API with your own key, billed per token by the provider. That is separate from the Claude consumer subscription, and you only pay for what you use.",
        },
        {
            id: "mobile",
            question: "Can I use Claude with Notion on my phone?",
            answer:
                "Yes. Any AI for Notion is on the iOS App Store, so the same Claude-powered assistant runs on your phone with voice input and on-device reminders.",
        },
    ],
    ctaLabel: "Add Claude to your Notion workspace",
};