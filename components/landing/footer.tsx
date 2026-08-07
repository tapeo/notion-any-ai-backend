import { Separator } from "@/components/ui/separator";
import Link from "next/link";

const FOOTER_LINKS: { href: string; label: string }[] = [
    { href: "/api/notion-oauth/start", label: "Connect Notion" },
    { href: "#faq", label: "FAQ" },
    { href: "#pricing", label: "Pricing" },
];

export function Footer() {
    return (
        <footer className="border-t border-border/60">
            <Separator />
            <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
                <div className="flex flex-col items-center gap-1 sm:items-start">
                    <p className="text-sm font-medium">Any AI for Notion</p>
                    <p className="text-xs text-muted-foreground">
                        Not affiliated with Notion. An unofficial tool.
                    </p>
                </div>
                <nav className="flex gap-5">
                    {FOOTER_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </footer>
    );
}