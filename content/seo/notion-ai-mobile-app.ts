import type { SeoPageContent } from "./types";

export const NOTION_AI_MOBILE_APP: SeoPageContent = {
    slug: "notion-ai-mobile-app",
    title: "Notion AI mobile app for iOS: your workspace AI assistant | Any AI for Notion",
    description:
        "A dedicated mobile AI assistant for Notion on iOS. Fast voice to text, on-device reminders, and full workspace read and write access from your phone.",
    heroBadge: "Mobile AI assistant",
    h1: "The dedicated mobile AI assistant for Notion",
    heroSubtext:
        "Fast voice to text, on-device notifications, and full Notion read and write access on iOS, with desktop builds from the open source repo.",
    sections: [
        {
            id: "mobile-features",
            title: "Mobile first features",
            bullets: [
                "Instant voice input: record an idea on the go, and the assistant transcribes it and files it cleanly into your Notion database.",
                "Native push reminders: local reminders trigger on your phone even when the app is closed.",
                "Deep links: open the exact Notion page the assistant is talking about, straight from the chat.",
                "Full workspace access: search, read, create, and update pages and databases from your phone.",
            ],
        },
        {
            id: "use-cases",
            title: "What it looks like in practice",
            bullets: [
                "Capture a voice note after a meeting and let the assistant format it into your meeting notes page.",
                "Ask what is on your plate today and get answers pulled from your task database.",
                "Set a reminder by telling the assistant, and get the push notification at the right time.",
            ],
        },
        {
            id: "desktop",
            title: "Desktop parity",
            paragraphs: [
                "The core is the same across platforms. The iOS app is on the App Store, a Linux build ships via snap, and the open source repo builds for macOS, Windows, and Linux from the same codebase.",
            ],
        },
    ],
    faqs: [
        {
            id: "ios",
            question: "Is there an iOS app?",
            answer:
                "Yes. Any AI for Notion is available on the iOS App Store as a one-time purchase. Your workspace connection and API keys live on your device.",
        },
        {
            id: "android",
            question: "Is there an Android app?",
            answer:
                "The codebase supports Android and builds from the open source repo, but there is no Play Store release yet. You can build and install it yourself from GitHub.",
        },
        {
            id: "voice",
            question: "How does voice input work?",
            answer:
                "Recording and transcription happen on device, and the transcribed text is sent to your configured AI endpoint. The assistant can then file the content into the right Notion page or database.",
        },
        {
            id: "reminders",
            question: "Do reminders work when the app is closed?",
            answer:
                "Yes. Reminders are local notifications scheduled on device, and they persist across app restarts on iOS and Android.",
        },
    ],
    ctaLabel: "Download for iOS",
};