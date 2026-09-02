"use client";

import { trackPricingView, trackSectionView } from "@/lib/analytics";
import { useEffect, useRef } from "react";

const OBSERVER_OPTIONS: IntersectionObserverInit = {
    root: null,
    rootMargin: "0px",
    threshold: 0.5,
};

export function SectionTracker() {
    const seenRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        const main = document.querySelector("main");
        if (!main) {
            return;
        }
        const sections = Array.from(
            main.querySelectorAll<HTMLElement>("section[id]"),
        );
        if (sections.length === 0) {
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                if (!entry.isIntersecting) {
                    continue;
                }
                const id = entry.target.getAttribute("id");
                if (!id) {
                    continue;
                }
                if (seenRef.current.has(id)) {
                    continue;
                }
                seenRef.current.add(id);
                trackSectionView(id);
                if (id === "pricing") {
                    trackPricingView();
                }
            }
        }, OBSERVER_OPTIONS);

        for (const section of sections) {
            observer.observe(section);
        }

        return () => {
            observer.disconnect();
        };
    }, []);

    return null;
}