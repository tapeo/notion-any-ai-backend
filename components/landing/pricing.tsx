import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TIERS, type Tier } from "@/content/landing/pricing";
import { AnalyticsEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { AppStoreBadge } from "./app-store-badge";
import { Container } from "./container";
import { GITHUB_URL } from "./hero";
import { TrackedLink } from "./tracked-link";

export function Pricing() {
    return (
        <section id="pricing" className="py-16 md:py-24">
            <Container>
                <div className="mx-auto mb-12 max-w-xl text-center">
                    <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                        One purchase, yours forever
                    </h2>
                    <p className="mt-3 text-sm text-muted-foreground md:text-base">
                        No subscriptions, no per-seat fees. Pay once and connect any AI to
                        your Notion workspace.
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground md:text-base">
                        The app is paid but fully open source. Your purchase supports
                        development, and the code is available{" "}
                        <TrackedLink
                            href={GITHUB_URL}
                            event={AnalyticsEvent.GITHUB_LINK_CLICK}
                            props={{ source: "pricing" }}
                            className="underline underline-offset-4 transition-colors hover:text-foreground"
                        >
                            on GitHub
                        </TrackedLink>
                        .
                    </p>
                </div>

                <div className="mx-auto grid max-w-md grid-cols-1 gap-6">
                    {TIERS.map((tier) => (
                        <TierCard key={tier.id} tier={tier} />
                    ))}
                </div>
            </Container>
        </section>
    );
}

function TierCard({ tier }: { tier: Tier }) {
    return (
        <div className="relative">
            {tier.highlight && (
                <Badge className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
                    Lifetime
                </Badge>
            )}
            <Card className={cn("gap-0", tier.highlight && "ring-2 ring-primary")}>
                <CardHeader className="gap-2">
                    <h3 className="text-base font-semibold">{tier.name}</h3>
                    <p className="text-sm text-muted-foreground">{tier.audience}</p>
                    <div className="mt-3 flex items-baseline gap-1.5">
                        <span className="text-4xl font-semibold tracking-tight">
                            {tier.price}
                        </span>
                        <span className="text-sm text-muted-foreground">
                            {tier.cadence}
                        </span>
                        {tier.originalPrice && (
                            <span className="ml-1 text-sm text-muted-foreground line-through">
                                {tier.originalPrice}
                            </span>
                        )}
                    </div>
                </CardHeader>
                <Separator className="mt-4" />
                <CardContent className="pt-4">
                    <ul className="space-y-2.5">
                        {tier.features.map((feature) => (
                            <li key={feature} className="flex items-start gap-2.5 text-sm">
                                <Check className="mt-0.5 size-4 shrink-0 text-foreground" />
                                <span className="text-muted-foreground">{feature}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-6 flex justify-center">
                        <AppStoreBadge href={tier.cta.href} source={`pricing-${tier.id}`} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}