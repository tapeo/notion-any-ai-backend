import type { SeoPageContent } from "./types";

export const LOCAL_LLM_TO_NOTION: SeoPageContent = {
    slug: "connect-local-llm-to-notion",
    title: "Connect local LLMs (Ollama, LM Studio) to Notion | Any AI for Notion",
    description:
        "Run Ollama, LM Studio, or vLLM models against your Notion workspace. Local inference, secure OAuth bridge, stateless backend. Nothing leaves your machine except Notion API calls.",
    heroBadge: "Local AI + Notion",
    h1: "Connect local LLMs (Ollama and LM Studio) to Notion",
    heroSubtext:
        "Run local AI models directly against your Notion workspace without sending your prompts to commercial cloud providers.",
    sections: [
        {
            id: "privacy",
            title: "The privacy architecture",
            paragraphs: [
                "Point the app at a local OpenAI-compatible endpoint such as http://localhost:11434/v1 for Ollama, and inference runs entirely on your machine. Your prompts and page content go to your own hardware, never to a cloud provider.",
                "The only network calls beyond your machine are Notion API requests, made with your OAuth token through a stateless open source proxy that stores no records.",
            ],
        },
        {
            id: "function-calling",
            title: "How tool calling works with local models",
            paragraphs: [
                "The app bridges OpenAI-compatible function calling with Notion REST API endpoints. Local models that support tool use, such as Llama 3.3, Qwen 2.5, or Mistral models, can emit tool calls the app executes against Notion. Pick a model with function calling support for the full read and write experience.",
            ],
        },
        {
            id: "setup",
            title: "Setup instructions",
            bullets: [
                "Step 1: install Ollama and pull a tool-capable model, or start an OpenAI-compatible server in LM Studio.",
                "Step 2: install Any AI for Notion, connect your workspace through Notion's official OAuth.",
                "Step 3: enter your localhost endpoint in the app settings, for example http://localhost:11434/v1.",
                "Step 4: chat and update pages completely locally.",
            ],
        },
        {
            id: "hardware",
            title: "What hardware you need",
            paragraphs: [
                "A machine with enough memory for the model you pick. Smaller tool-capable models run comfortably on a modern laptop; larger models benefit from a dedicated GPU. Because the app talks standard OpenAI-compatible HTTP, remote setups like a home server running vLLM work just as well as localhost.",
            ],
        },
    ],
    faqs: [
        {
            id: "why-local",
            question: "Why run a local model with Notion?",
            answer:
                "Privacy and cost. Local inference keeps your notes and prompts on your own hardware, and costs nothing per token. It also works offline except for the Notion API calls themselves.",
        },
        {
            id: "which-models",
            question: "Which local models work best?",
            answer:
                "Models with function calling support give the full experience: search, read, create, and update pages. Llama 3.3, Qwen 2.5, and Mistral variants are solid starting points that run on consumer hardware.",
        },
        {
            id: "ollama-setup",
            question: "How do I expose Ollama with an OpenAI-compatible API?",
            answer:
                "Ollama serves an OpenAI-compatible API at http://localhost:11434/v1 by default. Enter that endpoint in the app settings and pick your model.",
        },
        {
            id: "lm-studio",
            question: "Does LM Studio work too?",
            answer:
                "Yes. Start LM Studio's local server, which exposes an OpenAI-compatible endpoint, and point the app at it. Any OpenAI-compatible server, including vLLM, works the same way.",
        },
    ],
    ctaLabel: "Get started with local AI on Notion",
};