import { Container } from "./container";

const AGENTS: string[] = [
    "ChatGPT",
    "Claude",
    "Gemini",
    "Cursor",
    "Copilot",
    "Codex",
    "Amp",
];

export function TrustStrip() {
    return (
        <section id="works-with" className="py-10 pb-24">
            <Container>
                <div className="flex flex-col items-center gap-6">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                        Works with any AI
                    </p>
                    <div className="flex w-full flex-wrap items-center justify-center gap-x-8 gap-y-3">
                        {AGENTS.map((agent) => (
                            <span
                                key={agent}
                                className="text-sm font-medium text-muted-foreground/80"
                            >
                                {agent}
                            </span>
                        ))}
                    </div>
                </div>
            </Container>
        </section>
    );
}