import type { SeoPageContent } from "./types";

export const CHAT_WITH_NOTION: SeoPageContent = {
    slug: "chat-with-notion",
    title: "Chat with your Notion workspace: ask questions, get answers | Any AI for Notion",
    description:
        "Chat with Notion pages and databases using any AI model. Conversational search, database queries, persistent memory, and on-device reminders. One-time purchase, open source.",
    heroBadge: "AI chat for Notion",
    h1: "Chat with your Notion workspace",
    heroSubtext:
        "Ask questions, find buried information, and create notes conversationally across your entire Notion workspace, with the model of your choice.",
    sections: [
        {
            id: "capabilities",
            title: "Key capabilities",
            bullets: [
                "Conversational search: retrieve information across dozens of separate pages without manual keyword digging.",
                "Database queries: ask which projects are overdue and get direct answers with links.",
                "Create and edit: new pages, edits to existing pages, and appends to running documents, all from chat.",
                "Persistent memory: the assistant keeps an on-device memory file, so it remembers your preferences across chats.",
                "Built-in reminders: tell it to remind you tomorrow at 9 to review the launch doc, and a native push notification fires on your device.",
            ],
        },
        {
            id: "how",
            title: "How the chat works",
            paragraphs: [
                "The app connects to your workspace through Notion's official OAuth and gives your chosen model tool access to search, read, create, and update pages. When you ask a question, the model searches and reads the relevant pages, then answers with the actual content of your workspace, not a guess.",
                "You pick the pages the assistant can access, and you can revoke access at any time from your Notion settings.",
            ],
        },
        {
            id: "models",
            title: "Any model behind the chat",
            paragraphs: [
                "The chat is model agnostic. Use your OpenAI key, route Claude or Gemini through OpenRouter, or run a local Ollama model for private conversations. Switch models whenever your needs change.",
            ],
        },
    ],
    faqs: [
        {
            id: "how-different",
            question: "How is this different from Notion's search?",
            answer:
                "Notion search matches keywords. Chatting with Any AI for Notion means the model reads the actual page content, combines information across pages, and answers in natural language, with follow-up questions in the same conversation.",
        },
        {
            id: "which-pages",
            question: "Which pages can the assistant see?",
            answer:
                "Only the pages you authorize when connecting the workspace. You can grant access to specific pages or a whole workspace, and revoke any of it at any time from Notion's settings.",
        },
        {
            id: "databases",
            question: "Can it query Notion databases?",
            answer:
                "Yes. The assistant can query structured databases, so you can ask things like which projects are overdue or what is due this week and get answers drawn from your actual data.",
        },
        {
            id: "memory",
            question: "Does the assistant remember previous chats?",
            answer:
                "Yes. It maintains a persistent on-device memory file it can read and write, so facts and preferences carry across conversations.",
        },
    ],
    ctaLabel: "Start chatting with Notion",
};