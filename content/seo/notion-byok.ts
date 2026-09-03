import type { ComparisonRow } from "./types";
import type { SeoPageContent } from "./types";

export const NOTION_BYOK: SeoPageContent = {
    slug: "notion-byok",
    title: "Notion BYOK: bring your own API key to Notion | Any AI for Notion",
    description:
        "Use your own OpenAI, Anthropic, Groq, OpenRouter, or local Ollama key with Notion. Full read and write access, one-time purchase, open source. No $10 per seat add-on.",
    heroBadge: "Bring your own key",
    h1: "Notion BYOK: bring your own API key to Notion",
    heroSubtext:
        "Stop paying $10 per month per seat for a fixed model. Use your personal OpenAI, Anthropic, Groq, or OpenRouter key, or a local Ollama endpoint, directly against your Notion workspace.",
    sections: [
        {
            id: "cost",
            title: "What BYOK costs compared to Notion AI",
            paragraphs: [
                "Notion AI charges $10 per user per month regardless of how much you use it. With your own API key, you pay the provider directly at raw token prices.",
                "As a rough example, a few hundred prompts in a month often costs between $0.30 and $1.50 with a personal OpenAI or OpenRouter key, depending on the model and how much page content you send. Heavy users can still choose cheaper models, and local models through Ollama cost nothing per token.",
                "Either way, the price tracks your actual usage, not a flat seat fee.",
            ],
        },
        {
            id: "providers",
            title: "Supported providers",
            bullets: [
                "OpenAI, with any GPT model and your own key.",
                "OpenRouter, for access to Claude, Gemini, DeepSeek, Llama, and hundreds more with one key.",
                "Groq, for very fast inference on open models.",
                "DeepSeek, Together AI, Mistral, and any other OpenAI-compatible endpoint.",
                "Ollama or LM Studio on localhost, for fully local, private inference.",
            ],
        },
        {
            id: "no-compromise",
            title: "BYOK without compromise",
            bullets: [
                "Search across your entire workspace and pick the pages the assistant can see.",
                "Read page content and structured databases.",
                "Create new pages and edit existing ones with markdown.",
                "Append blocks to running documents like journals or meeting notes.",
                "On-device reminders, persistent memory, and voice input, all built in.",
            ],
        },
        {
            id: "security",
            title: "Where your key lives",
            paragraphs: [
                "Your API key and Notion token stay on your device in platform-native secure storage. The open source backend is a stateless proxy that forwards requests to Notion's official API, and it stores no user records or credentials.",
            ],
        },
    ],
    faqs: [
        {
            id: "what-is-byok",
            question: "What does BYOK mean?",
            answer:
                "Bring your own key. Instead of paying a subscription that includes AI usage at a markup, you register your own API key with a provider like OpenAI or OpenRouter and pay them directly for what you use.",
        },
        {
            id: "openrouter",
            question: "Can I use OpenRouter with Notion?",
            answer:
                "Yes. Any AI for Notion accepts any OpenAI-compatible endpoint, and OpenRouter exposes hundreds of models, including Claude and Gemini, through one OpenAI-compatible API. Enter your OpenRouter key and pick a model.",
        },
        {
            id: "ollama",
            question: "Can I use a local model with no API costs?",
            answer:
                "Yes. Point the app at a local Ollama or LM Studio endpoint, such as http://localhost:11434/v1, and run inference entirely on your own machine. Nothing leaves your device except Notion API calls.",
        },
        {
            id: "key-storage",
            question: "Does anyone else see my API key?",
            answer:
                "No. The key is stored encrypted on your device in platform-native secure storage and is sent only to the AI provider you configured. The proxy backend never sees or stores it.",
        },
    ],
    ctaLabel: "Unlock Notion BYOK",
};

export const NOTION_BYOK_COMPARISON: { otherLabel: string; rows: ComparisonRow[] } = {
    otherLabel: "Notion AI",
    rows: [
        { feature: "Use your own API key", anyAi: true, other: false },
        { feature: "Choose the model", anyAi: true, other: false },
        { feature: "Pay per use at raw token prices", anyAi: true, other: false },
        { feature: "Local models via Ollama", anyAi: true, other: false },
        { feature: "Read and write pages", anyAi: true, other: true },
        { feature: "No monthly seat fee", anyAi: true, other: false },
        { feature: "Open source", anyAi: true, other: false },
    ],
};