import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { AnalyticsEvent } from "@/lib/analytics";
import { Container } from "./container";
import { TrackedLink } from "./tracked-link";

export function CTA() {
    return (
        <section className="py-16 md:py-24">
            <Container>
                <div className="mx-auto max-w-xl rounded-xl border border-border/60 bg-card px-6 py-12 text-center">
                    <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                        Connect your AI to Notion today
                    </h2>
                    <p className="mt-3 text-sm text-muted-foreground md:text-base">
                        One purchase, any AI model, your entire workspace. No subscriptions,
                        fully open source.
                    </p>
                    <Button
                        render={<TrackedLink href="#pricing" event={AnalyticsEvent.CTA_CLICK_BOTTOM} />}
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