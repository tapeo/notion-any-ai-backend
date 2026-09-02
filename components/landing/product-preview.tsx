import Image from "next/image";

import { Container } from "./container";

export function ProductPreview() {
    return (
        <section id="preview" className="pb-16 md:pb-20">
            <Container>
                <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
                    <div className="flex items-center gap-1.5 border-b border-border/60 px-4 py-3">
                        <span className="size-2.5 rounded-full bg-muted-foreground/20" />
                        <span className="size-2.5 rounded-full bg-muted-foreground/20" />
                        <span className="size-2.5 rounded-full bg-muted-foreground/20" />
                    </div>
                    <Image
                        src="/app-light.png"
                        alt="Any AI for Notion app interface"
                        width={2152}
                        height={1622}
                        className="h-auto w-full dark:hidden"
                        priority
                    />
                    <Image
                        src="/app-dark.png"
                        alt="Any AI for Notion app interface"
                        width={2152}
                        height={1622}
                        className="hidden h-auto w-full dark:block"
                        priority
                    />
                </div>
            </Container>
        </section>
    );
}