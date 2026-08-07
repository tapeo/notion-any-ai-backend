import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import {
    Brain,
    RefreshCw,
    Search,
    Shield,
    Smartphone,
    Zap,
} from "lucide-react";
import { Container } from "./container";

type Feature = {
    icon: LucideIcon;
    title: string;
    description: string;
};

const FEATURES: Feature[] = [
    {
        icon: Brain,
        title: "Any AI model",
        description:
            "ChatGPT, Claude, Gemini, Cursor, Copilot, or any agent that can call an HTTP endpoint.",
    },
    {
        icon: Zap,
        title: "Read and write",
        description:
            "Your AI can read pages, create new content, and update existing pages in your workspace.",
    },
    {
        icon: Search,
        title: "Workspace search",
        description:
            "Search across your entire Notion workspace so your AI always has the right context.",
    },
    {
        icon: Shield,
        title: "Secure OAuth",
        description:
            "Uses Notion's official OAuth. You grant access and can revoke it anytime from Notion settings.",
    },
    {
        icon: Smartphone,
        title: "Mobile first",
        description:
            "Runs on your phone with a deep link to launch AI sessions against your Notion workspace.",
    },
    {
        icon: RefreshCw,
        title: "Always in sync",
        description:
            "Changes go straight to Notion in real time. No exports, no copies, no stale data.",
    },
];

export function Features() {
    return (
        <section id="features" className="py-16 md:py-24">
            <Container>
                <div className="mx-auto mb-12 max-w-xl text-center">
                    <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                        Everything your AI needs to work with Notion
                    </h2>
                    <p className="mt-3 text-sm text-muted-foreground md:text-base">
                        One app that bridges any AI agent and your Notion workspace, with
                        secure access and full read and write support.
                    </p>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {FEATURES.map((feature) => {
                        const Icon = feature.icon;
                        return (
                            <Card key={feature.title} className="gap-3">
                                <CardHeader>
                                    <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                                        <Icon className="size-5 text-foreground" />
                                    </div>
                                    <CardTitle className="mt-1">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        {feature.description}
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </Container>
        </section>
    );
}