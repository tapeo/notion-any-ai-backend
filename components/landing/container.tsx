export function Container({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    const base = "mx-auto max-w-5xl px-6";
    if (className) {
        return <div className={`${base} ${className}`}>{children}</div>;
    }
    return <div className={base}>{children}</div>;
}