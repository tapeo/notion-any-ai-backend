import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/landing/container";
import { Footer } from "@/components/landing/footer";
import { Nav } from "@/components/landing/nav";
import { ComparisonTable } from "@/components/seo/comparison-table";
import { CtaSection } from "@/components/seo/cta-section";
import { FaqSection } from "@/components/seo/faq-section";
import type {
    ComparisonTable as ComparisonTableData,
    SeoPageContent,
    SeoSection,
} from "@/content/seo/types";

function Section({ section }: { section: SeoSection }) {
    return (
        <section id={section.id} className="scroll-mt-24">
            <h2 className="text-xl font-semibold leading-tight tracking-tight md:text-2xl">
                {section.title}
            </h2>
            {section.paragraphs && (
                <div className="mt-4 space-y-4">
                    {section.paragraphs.map((paragraph) => (
                        <p
                            key={paragraph.slice(0, 32)}
                            className="text-base leading-relaxed text-muted-foreground"
                        >
                            {paragraph}
                        </p>
                    ))}
                </div>
            )}
            {section.bullets && (
                <ul className="mt-4 space-y-3">
                    {section.bullets.map((bullet) => (
                        <li
                            key={bullet.slice(0, 32)}
                            className="flex gap-3 text-base leading-relaxed text-muted-foreground"
                        >
                            <span
                                aria-hidden
                                className="mt-2 size-1.5 shrink-0 rounded-full bg-foreground/40"
                            />
                            {bullet}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

export function SeoPage({
    page,
    comparison,
}: {
    page: SeoPageContent;
    comparison?: ComparisonTableData;
}) {
    return (
        <div className="min-h-screen">
            <Nav />
            <main>
                <section className="pt-32 pb-16 md:pt-40 md:pb-20">
                    <div
                        aria-hidden
                        className="bg-grid mask-fade-b absolute inset-x-0 top-0 -z-10 h-[420px] opacity-40"
                    />
                    <Container>
                        <div className="mx-auto max-w-3xl text-center">
                            {page.heroBadge && (
                                <Badge variant="outline" className="mb-5">
                                    {page.heroBadge}
                                </Badge>
                            )}
                            <h1 className="text-3xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
                                {page.h1}
                            </h1>
                            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                                {page.heroSubtext}
                            </p>
                        </div>
                    </Container>
                </section>

                <section className="pb-16 md:pb-20">
                    <Container>
                        <div className="mx-auto max-w-3xl space-y-12 md:space-y-16">
                            {page.sections.map((section) => (
                                <Section key={section.id} section={section} />
                            ))}
                        </div>
                    </Container>
                </section>

                {comparison && (
                    <section className="border-y border-border/60 bg-muted/30 py-16 md:py-24">
                        <Container>
                            <div className="mx-auto mb-10 max-w-xl text-center">
                                <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                                    Side by side comparison
                                </h2>
                            </div>
                            <div className="mx-auto max-w-2xl">
                                <ComparisonTable
                                    otherLabel={comparison.otherLabel}
                                    rows={comparison.rows}
                                />
                            </div>
                        </Container>
                    </section>
                )}

                <FaqSection faqs={page.faqs} />
                <CtaSection page={page} />
            </main>
            <Footer />
        </div>
    );
}