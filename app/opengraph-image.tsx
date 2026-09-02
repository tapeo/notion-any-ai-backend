import { ImageResponse } from "next/og";

export const alt = "Any AI for Notion, connect any AI model to your Notion workspace";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 40,
                    backgroundColor: "#000000",
                    backgroundImage:
                        "radial-gradient(circle at 50% 0%, #27272a 0%, #000000 70%)",
                }}
            >
                <svg width="150" height="150" viewBox="0 0 64 64" fill="none">
                    <path
                        d="M43.79 19.71 C37.07 29.96 37.07 37.04 44.14 47.64 C33.54 40.57 26.46 40.57 16.21 47.29 C22.93 37.04 22.93 29.96 15.86 19.36 C26.46 26.43 33.54 26.43 43.79 19.71 Z"
                        fill="#ffffff"
                    />
                    <circle cx="49.5" cy="17.5" r="4.5" fill="#ffffff" />
                </svg>
                <div
                    style={{
                        display: "flex",
                        fontSize: 68,
                        fontWeight: 700,
                        color: "#fafafa",
                        letterSpacing: -2,
                    }}
                >
                    Any AI for Notion
                </div>
                <div
                    style={{
                        display: "flex",
                        fontSize: 30,
                        color: "#a1a1aa",
                    }}
                >
                    Connect ChatGPT, Claude, Gemini, or any AI agent to your Notion
                    workspace
                </div>
            </div>
        ),
        { ...size },
    );
}
