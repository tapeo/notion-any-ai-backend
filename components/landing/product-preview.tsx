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
                    <div className="relative aspect-video w-full bg-muted/40">
                        <div className="flex h-full w-full items-center justify-center">
                            <div className="text-center">
                                <p className="text-sm font-medium text-muted-foreground">
                                    App preview
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground/70">
                                    Screenshot coming soon
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
}