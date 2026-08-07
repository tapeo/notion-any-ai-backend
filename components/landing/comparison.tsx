import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Check, Minus } from "lucide-react";
import { Container } from "./container";

type Row = { feature: string; you: boolean; alt: boolean };

const ROWS: Row[] = [
    { feature: "Use any AI model, not just one", you: true, alt: false },
    { feature: "Read and write Notion pages", you: true, alt: true },
    { feature: "Works with your existing AI agent", you: true, alt: false },
    { feature: "No per-seat AI subscription", you: true, alt: false },
    { feature: "Secure OAuth connection", you: true, alt: true },
    { feature: "Mobile app with deep links", you: true, alt: false },
    { feature: "One-time purchase", you: true, alt: false },
    { feature: "No limited free trial (few messages)", you: true, alt: false },
];

export function Comparison() {
    return (
        <section
            id="compare"
            className="border-y border-border/60 bg-muted/30 py-16 md:py-24"
        >
            <Container>
                <div className="mx-auto mb-10 max-w-xl text-center">
                    <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                        Why Any AI for Notion
                    </h2>
                    <p className="mt-3 text-sm text-muted-foreground md:text-base">
                        A quick comparison with Notion AI.
                    </p>
                </div>
                <div className="mx-auto max-w-2xl overflow-hidden rounded-xl border border-border/60 bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-border/60 hover:bg-transparent">
                                <TableHead className="h-11 pl-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Feature
                                </TableHead>
                                <TableHead className="h-11 text-center text-xs font-semibold">
                                    Any AI for Notion
                                </TableHead>
                                <TableHead className="h-11 pr-4 text-center text-xs font-medium text-muted-foreground">
                                    Notion AI
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {ROWS.map((row) => (
                                <TableRow
                                    key={row.feature}
                                    className="border-border/60 hover:bg-muted/40"
                                >
                                    <TableCell className="py-3 pl-4 text-sm text-muted-foreground">
                                        {row.feature}
                                    </TableCell>
                                    <TableCell className="py-3 text-center">
                                        {row.you ? (
                                            <Check className="mx-auto size-4 text-foreground" />
                                        ) : (
                                            <Minus className="mx-auto size-4 text-muted-foreground/40" />
                                        )}
                                    </TableCell>
                                    <TableCell className="py-3 pr-4 text-center">
                                        {row.alt ? (
                                            <Check className="mx-auto size-4 text-muted-foreground" />
                                        ) : (
                                            <Minus className="mx-auto size-4 text-muted-foreground/40" />
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </Container>
        </section>
    );
}