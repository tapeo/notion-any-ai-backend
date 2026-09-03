import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Container } from "@/components/landing/container";
import type { SeoFaq } from "@/content/seo/types";
import { ArrowUpRight } from "lucide-react";

export function FaqSection({ faqs }: { faqs: SeoFaq[] }) {
    return (
        <section id="faq" className="py-16 md:py-24">
            <Container>
                <div className="mx-auto max-w-2xl">
                    <div className="mb-8 text-center">
                        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                            Frequently asked questions
                        </h2>
                    </div>
                    <Accordion>
                        {faqs.map((faq) => (
                            <AccordionItem key={faq.id} value={faq.id}>
                                <AccordionTrigger>{faq.question}</AccordionTrigger>
                                <AccordionContent className="text-muted-foreground">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        Have another question? Reach the open source repo on{" "}
                        <a
                            href="https://github.com/tapeo/notion-any-ai"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-medium text-foreground underline underline-offset-4 transition-colors hover:opacity-80"
                        >
                            GitHub
                            <ArrowUpRight className="size-4" />
                        </a>
                        .
                    </p>
                </div>
            </Container>
        </section>
    );
}