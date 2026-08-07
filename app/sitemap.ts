import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: "https://anyaifornotion.com",
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 1,
        },
    ];
}