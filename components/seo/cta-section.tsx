"use client";

import { AppStoreBadge } from "@/components/landing/app-store-badge";
import { Container } from "@/components/landing/container";
import { TrackedLink } from "@/components/landing/tracked-link";
import { AnalyticsEvent } from "@/lib/analytics";
import { APP_STORE_URL, GITHUB_URL, type SeoPageContent } from "@/content/seo/types";

export function CtaSection({ page }: { page: SeoPageContent }) {
    return (
        <section className="pb-16 md:pb-24">
            <Container>
                <div className="mx-auto max-w-xl rounded-xl border border-border/60 bg-card px-6 py-12 text-center">
                    <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                        {page.ctaLabel}
                    </h2>
                    <p className="mt-3 text-sm text-muted-foreground md:text-base">
                        One-time purchase, any AI model, your entire workspace. No
                        subscriptions, fully open source.
                    </p>
                    <div className="mt-8 flex flex-col items-center gap-4">
                        <AppStoreBadge
                            href={APP_STORE_URL}
                            source={`seo-${page.slug}`}
                        />
                        <TrackedLink
                            href={GITHUB_URL}
                            event={AnalyticsEvent.CTA_CLICK_SEO_PAGE}
                            props={{ source: `seo-${page.slug}`, target: "github" }}
                            className="text-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
                        >
                            Or build it from source on GitHub
                        </TrackedLink>
                    </div>
                </div>
            </Container>
        </section>
    );
}