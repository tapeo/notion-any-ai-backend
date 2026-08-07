import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQS } from "@/content/landing/faqs";
import { Container } from "./container";

export function Faq() {
    return (
        <section id="faq" className="py-16 md:py-24">
            <Container>
                <div className="mx-auto max-w-2xl">
                    <div className="mb-8 text-center">
                        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                            Frequently asked questions
                        </h2>
                        <p className="mt-3 text-sm text-muted-foreground md:text-base">
                            Everything you need to know about the app.
                        </p>
                    </div>
                    <Accordion>
                        {FAQS.map((faq) => (
                            <AccordionItem key={faq.id} value={faq.id}>
                                <AccordionTrigger>{faq.question}</AccordionTrigger>
                                <AccordionContent className="text-muted-foreground">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </Container>
        </section>
    );
}