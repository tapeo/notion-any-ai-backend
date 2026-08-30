import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "./container";

export function Hero() {
    return (
        <section id="top" className="relative overflow-hidden pt-20 pb-16 md:pt-28 md:pb-20">
            <div
                aria-hidden
                className="bg-grid mask-fade-b absolute inset-0 -z-10 opacity-50"
            />
            <Container>
                <div className="mx-auto max-w-2xl text-center">
                    <Badge variant="outline" className="mb-5">
                        Custom AI providers for Notion
                    </Badge>
                    <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
                        Use any AI to read and write your Notion pages
                    </h1>
                    <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
                        Connect ChatGPT, Claude, Gemini, or any AI agent to your Notion
                        workspace. Read pages, draft content, and update databases, all
                        through a secure mobile app.
                    </p>
                    <div className="mt-8 flex justify-center gap-3">
                        <Button
                            render={<Link href="#pricing" />}
                            nativeButton={false}
                            size="lg"
                        >
                            Get the app
                            <ArrowRight className="ml-1.5 size-4" />
                        </Button>
                        <Button
                            render={<a href="#features" />}
                            nativeButton={false}
                            variant="outline"
                            size="lg"
                        >
                            See how it works
                        </Button>
                    </div>
                </div>
            </Container>
        </section>
    );
}