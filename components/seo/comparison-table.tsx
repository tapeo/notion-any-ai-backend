import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Check, Minus } from "lucide-react";
import type { ComparisonRow } from "@/content/seo/types";

function CellValue({ value }: { value: boolean | string }) {
    if (typeof value === "string") {
        return <span className="text-sm text-muted-foreground">{value}</span>;
    }
    if (value) {
        return <Check className="mx-auto size-4 text-foreground" aria-label="Yes" />;
    }
    return (
        <Minus
            className="mx-auto size-4 text-muted-foreground/40"
            aria-label="No"
        />
    );
}

function Row({ row }: { row: ComparisonRow }) {
    return (
        <TableRow className="border-border/60 hover:bg-muted/40">
            <TableCell className="py-3 pl-4 text-sm text-muted-foreground">
                {row.feature}
            </TableCell>
            <TableCell className="py-3 text-center">
                <CellValue value={row.anyAi} />
            </TableCell>
            <TableCell className="py-3 pr-4 text-center">
                <CellValue value={row.other} />
            </TableCell>
        </TableRow>
    );
}

export function ComparisonTable({
    otherLabel,
    rows,
}: {
    otherLabel: string;
    rows: ComparisonRow[];
}) {
    return (
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
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
                            {otherLabel}
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((row) => <Row key={row.feature} row={row} />)}
                </TableBody>
            </Table>
        </div>
    );
}