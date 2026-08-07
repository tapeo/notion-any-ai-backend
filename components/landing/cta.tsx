import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Container } from "./container";

export function CTA() {
    return (
        <section className="py-16 md:py-24">
            <Container>
                <div className="mx-auto max-w-xl rounded-xl border border-border/60 bg-card px-6 py-12 text-center">
                    <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                        Connect your AI to Notion today
                    </h2>
                    <p className="mt-3 text-sm text-muted-foreground md:text-base">
                        One purchase, any AI model, your entire workspace. No subscriptions.
                    </p>
                    <Button
                        render={<Link href="#pricing" />}
                        nativeButton={false}
                        size="lg"
                        className="mt-8"
                    >
                        Get the app
                        <ArrowRight className="ml-1.5 size-4" />
                    </Button>
                </div>
            </Container>
        </section>
    );
}