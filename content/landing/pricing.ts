export type Tier = {
    id: "lifetime";
    name: string;
    audience: string;
    price: string;
    originalPrice: string;
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
        price: "$2.99",
        originalPrice: "$4.99",
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
        cta: { label: "Get the app", href: "#pricing" },
    },
];