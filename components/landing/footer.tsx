import { Separator } from "@/components/ui/separator";
import Link from "next/link";

type FooterLink = { href: string; label: string; external?: boolean };
type FooterGroup = { title: string; links: FooterLink[] };

const MAIN_LINKS: FooterLink[] = [
    { href: "/api/notion-oauth/start", label: "Connect Notion" },
    { href: "#faq", label: "FAQ" },
    { href: "#pricing", label: "Pricing" },
    { href: "/privacy", label: "Privacy" },
    {
        href: "https://github.com/tapeo/notion-any-ai",
        label: "GitHub",
        external: true,
    },
];

const COMPARE_LINKS: FooterLink[] = [
    { href: "/notion-ai-alternative", label: "Notion AI alternative" },
    { href: "/vs/notion-ai", label: "Any AI vs Notion AI" },
    { href: "/vs/notion-mcp", label: "Any AI vs Notion MCP" },
    { href: "/notion-ai-lifetime", label: "Lifetime deal" },
];

const INTEGRATION_LINKS: FooterLink[] = [
    { href: "/connect/chatgpt-to-notion", label: "ChatGPT to Notion" },
    { href: "/connect/claude-to-notion", label: "Claude to Notion" },
    { href: "/connect/gemini-to-notion", label: "Gemini to Notion" },
    { href: "/connect/local-llm-to-notion", label: "Local LLM to Notion" },
    { href: "/notion-byok", label: "Notion BYOK" },
];

const USE_CASE_LINKS: FooterLink[] = [
    { href: "/chat-with-notion", label: "Chat with Notion" },
    { href: "/notion-ai-mobile-app", label: "Mobile app" },
    { href: "/open-source-notion-ai", label: "Open source" },
];

function FooterLinkItem({ link }: { link: FooterLink }) {
    if (link.external) {
        return (
            <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
                {link.label}
            </a>
        );
    }
    return (
        <Link
            href={link.href}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
            {link.label}
        </Link>
    );
}

function FooterGroupColumn({ group }: { group: FooterGroup }) {
    return (
        <div className="flex flex-col items-center gap-2.5 sm:items-start">
            <p className="text-xs font-medium uppercase tracking-wide text-foreground/70">
                {group.title}
            </p>
            {group.links.map((link) => (
                <FooterLinkItem key={link.href} link={link} />
            ))}
        </div>
    );
}

export function Footer() {
    const groups: FooterGroup[] = [
        { title: "Compare", links: COMPARE_LINKS },
        { title: "Integrations", links: INTEGRATION_LINKS },
        { title: "Use cases", links: USE_CASE_LINKS },
    ];

    return (
        <footer className="border-t border-border/60">
            <Separator />
            <div className="mx-auto max-w-5xl px-6 py-10">
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {groups.map((group) => (
                        <FooterGroupColumn key={group.title} group={group} />
                    ))}
                    <FooterGroupColumn group={{ title: "Site", links: MAIN_LINKS }} />
                </div>
                <div className="mt-8 flex flex-col items-center gap-1 sm:items-start">
                    <p className="text-sm font-medium">Any AI for Notion</p>
                    <p className="text-xs text-muted-foreground">
                        Not affiliated with Notion. An unofficial tool.
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Built with{" "}
                        <a
                            href="https://flutteragentkit.com/"
                            target="_blank"
                            rel="noopener noreferrer sponsored"
                            title="Built with Flutter Agent Kit"
                            className="underline underline-offset-2 transition-colors hover:text-foreground"
                        >
                            Flutter Agent Kit
                        </a>
                        .
                    </p>
                </div>
            </div>
        </footer>
    );
}