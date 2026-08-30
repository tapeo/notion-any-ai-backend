"use client";

import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

type NavLink = { href: string; label: string };

const LINKS: NavLink[] = [
    { href: "#features", label: "Features" },
    { href: "#compare", label: "Compare" },
    { href: "#pricing", label: "Pricing" },
    { href: "#faq", label: "FAQ" },
];

export function Nav() {
    const [open, setOpen] = useState(false);

    return (
        <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
            <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
                <Link
                    href="/"
                    className="flex items-center gap-2 text-sm font-semibold tracking-tight"
                >
                    <Image
                        src="/logo.svg"
                        alt=""
                        width={28}
                        height={28}
                        className="size-7 rounded-md"
                    />
                    Any AI for Notion
                </Link>

                <div className="hidden items-center gap-1 md:flex">
                    {LINKS.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                            {link.label}
                        </a>
                    ))}
                    <Button
                        render={<a href="#pricing" />}
                        nativeButton={false}
                        size="sm"
                        className="ml-2"
                    >
                        Get the app
                    </Button>
                </div>

                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger
                        render={
                            <Button
                                variant="ghost"
                                size="icon"
                                className="md:hidden"
                                aria-label="Toggle menu"
                            />
                        }
                    >
                        <Menu className="size-5" />
                    </SheetTrigger>
                    <SheetContent side="right" className="w-72">
                        <SheetHeader>
                            <SheetTitle>Menu</SheetTitle>
                        </SheetHeader>
                        <Separator />
                        <div className="flex flex-col gap-1 p-4">
                            {LINKS.map((link) => (
                                <SheetClose
                                    key={link.href}
                                    render={
                                        <a
                                            href={link.href}
                                            className="rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                        />
                                    }
                                >
                                    {link.label}
                                </SheetClose>
                            ))}
                            <SheetClose
                                render={
                                    <Button
                                        render={<a href="#pricing" />}
                                        nativeButton={false}
                                        size="sm"
                                        className="mt-3"
                                    />
                                }
                            >
                                Get the app
                            </SheetClose>
                        </div>
                    </SheetContent>
                </Sheet>
            </nav>
        </header>
    );
}