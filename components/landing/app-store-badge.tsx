import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

type AppStoreBadgeProps = {
    href: string;
    className?: string;
};

/**
 * Official Apple "Download on the App Store" badge.
 * Uses the white badge in light mode and the black badge in dark mode.
 * Artwork provided by Apple's App Store Marketing Tools.
 * Guidelines: https://developer.apple.com/app-store/marketing/guidelines/
 */
export function AppStoreBadge({ href, className }: AppStoreBadgeProps) {
    return (
        <Link
            href={href}
            className={cn(
                "inline-flex items-center justify-center transition-opacity hover:opacity-80",
                className,
            )}
            aria-label="Download on the App Store"
        >
            <Image
                src="/app-store-badge-white.svg"
                alt="Download on the App Store"
                width={120}
                height={40}
                className="h-10 w-auto dark:hidden"
                priority
            />
            <Image
                src="/app-store-badge-black.svg"
                alt="Download on the App Store"
                width={120}
                height={40}
                className="hidden h-10 w-auto dark:inline-block"
                priority
            />
        </Link>
    );
}