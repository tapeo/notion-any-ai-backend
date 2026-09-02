"use client";

import { trackEvent } from "@/lib/analytics";
import type { ReactNode } from "react";

type TrackedLinkProps = {
    event: string;
    props?: Record<string, string | number | boolean>;
    href: string;
    className?: string;
    target?: string;
    rel?: string;
    ariaLabel?: string;
    children?: ReactNode;
};

export function TrackedLink({
    event,
    props,
    href,
    className,
    target,
    rel,
    ariaLabel,
    children,
}: TrackedLinkProps) {
    let external = false;
    if (href.startsWith("http") || href.startsWith("mailto:")) {
        external = true;
    }

    let linkProps: Record<string, string> = {};
    if (external) {
        linkProps = { target: target ?? "_blank", rel: rel ?? "noopener noreferrer" };
    } else if (target && rel) {
        linkProps = { target, rel };
    }

    return (
        <a
            href={href}
            className={className}
            aria-label={ariaLabel}
            {...linkProps}
            onClick={() => {
                trackEvent(event, props ? { props } : undefined);
            }}
        >
            {children}
        </a>
    );
}