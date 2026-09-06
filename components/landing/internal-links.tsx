import { Container } from "@/components/landing/container";
import Link from "next/link";

const LINK_GROUPS: { title: string; links: { href: string; label: string }[] }[] = [
    {
        title: "Compare",
        links: [
            { href: "/notion-ai-alternative", label: "Notion AI alternative" },
            { href: "/vs/notion-ai", label: "Any AI vs Notion AI" },
            { href: "/vs/notion-mcp", label: "Any AI vs Notion MCP" },
        ],
    },
    {
        title: "Connect",
        links: [
            { href: "/connect/chatgpt-to-notion", label: "Connect ChatGPT to Notion" },
            { href: "/connect/claude-to-notion", label: "Connect Claude to Notion" },
            { href: "/notion-claude", label: "Notion Claude" },
            { href: "/connect/gemini-to-notion", label: "Connect Gemini to Notion" },
            { href: "/connect/local-llm-to-notion", label: "Connect local LLMs to Notion" },
        ],
    },
    {
        title: "Use cases",
        links: [
            { href: "/notion-byok", label: "Bring your own API key" },
            { href: "/chat-with-notion", label: "Chat with your workspace" },
            { href: "/notion-ai-mobile-app", label: "Mobile assistant" },
            { href: "/notion-ai-lifetime", label: "Notion AI lifetime deal" },
            { href: "/open-source-notion-ai", label: "Open source assistant" },
        ],
    },
];

function LinkGroup({ title, links }: { title: string; links: { href: string; label: string }[] }) {
    return (
        <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {title}
            </p>
            <ul className="mt-3 space-y-2">
                {links.map((link) => (
                    <li key={link.href}>
                        <Link
                            href={link.href}
                            className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                        >
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export function InternalLinks() {
    return (
        <section className="border-t border-border/60 py-16 md:py-20">
            <Container>
                <div className="mx-auto mb-10 max-w-xl text-center">
                    <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                        Explore integrations and comparisons
                    </h2>
                </div>
                <div className="mx-auto grid max-w-3xl gap-8 sm:grid-cols-3">
                    {LINK_GROUPS.map((group) => (
                        <LinkGroup key={group.title} title={group.title} links={group.links} />
                    ))}
                </div>
            </Container>
        </section>
    );
}