import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-sans",
});

export const metadata: Metadata = {
    title: {
        default: "Any AI for Notion",
        template: "%s · Any AI for Notion",
    },
    description:
        "Use any AI model to read and write your Notion workspace. Connect your favorite AI agent to Notion in seconds.",
    metadataBase: new URL("https://anyaifornotion.com"),
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={inter.variable} suppressHydrationWarning>
            <head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
                    }}
                />
            </head>
            <body className="bg-background text-foreground antialiased">
                {children}
            </body>
        </html>
    );
}