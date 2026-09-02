export type Tier = {
    id: "lifetime";
    name: string;
    audience: string;
    price: string;
    cadence: string;
    highlight: boolean;
    features: string[];
    cta: { label: string; href: string };
};

export const TIERS: Tier[] = [
    {
        id: "lifetime",
        name: "Lifetime",
        audience: "One purchase, yours forever",
        price: "$9.99",
        cadence: "one-time",
        highlight: true,
        features: [
            "Connect any AI model to Notion",
            "Read, create, and update pages",
            "Search across your entire workspace",
            "Secure OAuth connection",
            "Fully open source, inspect the code",
            "All future updates included",
            "14-day money-back guarantee",
        ],
        cta: { label: "Get the app", href: "https://apps.apple.com/us/app/any-ai-for-notion/id6789153536" },
    },
];