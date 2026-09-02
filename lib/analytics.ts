type PlausibleProps = Record<string, string | number | boolean>;

type PlausibleResult = {
    status?: string;
    error?: string;
};

type PlausibleOptions = {
    props?: PlausibleProps;
    callback?: (result: PlausibleResult) => void;
    interactive?: boolean;
};

type PlausibleFn = (event: string, options?: PlausibleOptions) => void;

declare global {
    interface Window {
        plausible?: PlausibleFn;
    }
}

export const AnalyticsEvent = {
    CTA_CLICK_HERO_PRIMARY: "CTA Click Hero Primary",
    CTA_CLICK_HERO_SECONDARY: "CTA Click Hero Secondary",
    CTA_CLICK_NAV_GET_APP: "CTA Click Nav Get App",
    CTA_CLICK_BOTTOM: "CTA Click Bottom",
    CTA_CLICK_APP_STORE: "CTA Click App Store",
    GITHUB_LINK_CLICK: "GitHub Link Click",
    NAV_LINK_CLICK: "Nav Link Click",
    SECTION_VIEW: "Section View",
    SECTION_VIEW_PRICING: "Section View Pricing",
} as const;

export function trackEvent(event: string, options?: PlausibleOptions): void {
    if (typeof window === "undefined") {
        return;
    }
    if (typeof window.plausible !== "function") {
        return;
    }
    try {
        window.plausible(event, options);
    } catch {
    }
}

export function trackCtaClick(event: string): void {
    trackEvent(event);
}

export function trackNavLinkClick(target: string): void {
    trackEvent(AnalyticsEvent.NAV_LINK_CLICK, { props: { target } });
}

export function trackSectionView(id: string): void {
    trackEvent(AnalyticsEvent.SECTION_VIEW, {
        props: { id },
        interactive: false,
    });
}

export function trackPricingView(): void {
    trackEvent(AnalyticsEvent.SECTION_VIEW_PRICING, {
        interactive: false,
    });
}

export function trackAppStoreClick(source: string): void {
    trackEvent(AnalyticsEvent.CTA_CLICK_APP_STORE, { props: { source } });
}

export function trackGithubClick(source: string): void {
    trackEvent(AnalyticsEvent.GITHUB_LINK_CLICK, { props: { source } });
}