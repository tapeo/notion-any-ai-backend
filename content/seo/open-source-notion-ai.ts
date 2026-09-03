import type { SeoPageContent } from "./types";

export const OPEN_SOURCE_NOTION_AI: SeoPageContent = {
    slug: "open-source-notion-ai",
    title: "Open source Notion AI assistant: audit every line | Any AI for Notion",
    description:
        "A 100% open source AI assistant for Notion. Stateless backend, on-device token storage, GPLv3 licensed. Inspect the code, self-host, or build from source.",
    heroBadge: "100% open source",
    h1: "100% open source AI assistant for Notion",
    heroSubtext:
        "Inspect every line of code. Built with Flutter, powered by a stateless Next.js proxy, and licensed under GPLv3.",
    sections: [
        {
            id: "privacy-architecture",
            title: "Privacy architecture",
            bullets: [
                "Stateless backend: the companion backend has no database and stores zero user records or credentials.",
                "On-device storage: Notion tokens and API keys live in platform-native secure storage, such as the iOS Keychain or Android Keystore.",
                "Direct token delivery: requests go from your device through the OAuth proxy straight to the official Notion REST API.",
            ],
        },
        {
            id: "stack",
            title: "The stack",
            paragraphs: [
                "The app is built with Flutter, so one codebase targets iOS, Android, macOS, Windows, and Linux. The companion backend is a small Next.js proxy that bridges Notion OAuth and the Notion REST API. Both are open source on GitHub.",
            ],
        },
        {
            id: "developer",
            title: "Build it yourself",
            paragraphs: [
                "The repository covers the app, its built-in tools (reminders, memory, voice input, URL fetching), and the backend. Clone the repo, set up Flutter with FVM, and run it locally against your own workspace and endpoint. The GPLv3 license guarantees that right permanently.",
            ],
        },
        {
            id: "why-open",
            title: "Why open source matters for a Notion integration",
            paragraphs: [
                "A Notion assistant sees your notes, plans, and possibly client work. With a closed tool you take that on trust. Here you can verify exactly what is sent, where tokens are stored, and what the backend does, or run the pieces yourself.",
            ],
        },
    ],
    faqs: [
        {
            id: "license",
            question: "What license is it under?",
            answer:
                "GPLv3. You can inspect, modify, and build the code, and derivatives must stay open under the same license.",
        },
        {
            id: "self-host",
            question: "Can I self-host it?",
            answer:
                "Yes. The backend is a small stateless Next.js proxy you can deploy anywhere, and the app builds from source with Flutter. Point the app at your own deployment if you prefer.",
        },
        {
            id: "why-paid",
            question: "Why is an open source app paid?",
            answer:
                "The purchase funds ongoing development and gets you the convenient App Store install with automatic updates. You remain free to inspect the code or build it yourself from source.",
        },
        {
            id: "token-storage",
            question: "Where are my tokens stored?",
            answer:
                "On your device, in platform-native secure storage such as the iOS Keychain or Android Keystore. The backend never persists credentials.",
        },
    ],
    ctaLabel: "View on GitHub or get the app",
};