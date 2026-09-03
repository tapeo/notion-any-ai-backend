import type { ComparisonRow, SeoPageContent } from "./types";

export const VS_NOTION_MCP: SeoPageContent = {
    slug: "vs-notion-mcp",
    title: "Notion MCP alternative: turnkey app vs raw protocol | Any AI for Notion",
    description:
        "Notion MCP servers need terminal setup and only work inside desktop AI tools. Any AI for Notion gives you a one-click OAuth app with iOS support, reminders, memory, and voice input.",
    heroBadge: "MCP comparison",
    h1: "Notion MCP vs Any AI: turnkey app or raw protocol?",
    heroSubtext:
        "Want AI in your Notion without setting up terminal servers, Docker containers, or JSON config files? Here is how the official and community MCP servers compare with a dedicated app.",
    sections: [
        {
            id: "setup",
            title: "Setup: terminal commands vs one-click OAuth",
            paragraphs: [
                "MCP setup means installing a server package, configuring an MCP client such as Claude Desktop or Cursor, and often editing JSON config files or managing an OAuth client. Community servers add npm installs and environment variables.",
                "Any AI for Notion is an installable app. You connect your workspace with one tap through Notion's official OAuth, paste an API key, and you are chatting with your workspace.",
            ],
        },
        {
            id: "platforms",
            title: "Platform support",
            paragraphs: [
                "MCP clients live inside specific desktop tools: Claude Desktop, Claude Code, Cursor, and similar. There is no official Notion MCP experience on a phone. Any AI for Notion works natively on iOS through the App Store, on Linux via snap, and builds for every other platform from the open source repo.",
            ],
        },
        {
            id: "built-in-tools",
            title: "Built-in tools beyond Notion",
            bullets: [
                "On-device push reminders that fire even when the app is closed.",
                "Persistent markdown memory the assistant reads and writes across conversations.",
                "Voice input with on-device transcription.",
                "Webpage URL fetching, so the assistant can pull in content from the web.",
            ],
        },
        {
            id: "under-the-hood",
            title: "What happens under the hood",
            paragraphs: [
                "Any AI for Notion bridges OpenAI-compatible tool calls with Notion REST API endpoints. Your model emits a tool call, the app performs the corresponding Notion API call with your OAuth token, and the result goes back to the model. It is the same pattern MCP servers implement, packaged as an app.",
                "For developers who want to verify that: the app and the backend are open source, so you can read exactly which endpoints are called and how tokens are stored.",
            ],
        },
        {
            id: "when-mcp",
            title: "When the Notion MCP is the better pick",
            paragraphs: [
                "If you already live inside Claude Desktop or Cursor on desktop and want Notion as one more tool in that harness, the MCP server is a good fit. It keeps everything in the tool you already use. The tradeoff is setup effort, desktop-only usage, and no mobile access.",
            ],
        },
    ],
    faqs: [
        {
            id: "what-is-notion-mcp",
            question: "What is the Notion MCP?",
            answer:
                "Notion offers a hosted Model Context Protocol server that lets MCP-capable tools like Claude Desktop, Claude Code, Cursor, and ChatGPT Pro connect to a Notion workspace. Community open source MCP servers offer a self-hosted equivalent.",
        },
        {
            id: "mcp-mobile",
            question: "Does Notion MCP work on mobile?",
            answer:
                "Not on its own. MCP servers run on a machine and are consumed by desktop MCP clients. To use AI with Notion on your phone, you need a native mobile app like Any AI for Notion.",
        },
        {
            id: "mcp-vs-app",
            question: "Which should I use, MCP or a dedicated app?",
            answer:
                "If you want AI inside your existing desktop coding or chat tools, MCP fits. If you want a standalone assistant with mobile support, voice input, reminders, and memory, a dedicated app is simpler and faster to set up.",
        },
        {
            id: "open-source-parity",
            question: "Is the app as transparent as a self-hosted MCP server?",
            answer:
                "Yes. Both the app and the proxy backend are open source under GPLv3, so you can audit exactly how your Notion token and API keys are handled.",
        },
    ],
    ctaLabel: "Download Any AI for mobile",
};

export const VS_NOTION_MCP_COMPARISON: { otherLabel: string; rows: ComparisonRow[] } = {
    otherLabel: "Notion MCP server",
    rows: [
        { feature: "Installable app, no terminal", anyAi: true, other: false },
        { feature: "Works on mobile", anyAi: true, other: false },
        { feature: "One-click OAuth", anyAi: true, other: false },
        { feature: "Built-in reminders and memory", anyAi: true, other: false },
        { feature: "Voice input", anyAi: true, other: false },
        { feature: "Runs inside Claude Desktop or Cursor", anyAi: false, other: true },
        { feature: "Open source", anyAi: true, other: true },
    ],
};