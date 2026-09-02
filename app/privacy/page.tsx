import type { Metadata } from "next";
import { Container } from "@/components/landing/container";
import { Footer } from "@/components/landing/footer";
import { Nav } from "@/components/landing/nav";

export const metadata: Metadata = {
    title: "Privacy policy",
    description:
        "How Any AI for Notion handles the data connected through Notion OAuth and the anonymous pageview analytics collected on this site.",
    alternates: {
        canonical: "/privacy",
    },
    robots: {
        index: true,
        follow: true,
    },
};

const CONTACT_EMAIL = "info@matteoricupero.it";

function Section({
    id,
    title,
    children,
}: {
    id: string;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section id={id} className="scroll-mt-24">
            <h2 className="text-xl font-semibold leading-tight tracking-tight md:text-2xl">
                {title}
            </h2>
            <div className="mt-4 space-y-4">{children}</div>
        </section>
    );
}

function Paragraph({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-base leading-relaxed text-muted-foreground">
            {children}
        </p>
    );
}

export default function PrivacyPage() {
    return (
        <div className="min-h-screen">
            <Nav />
            <main>
                <section className="pt-32 pb-16 md:pt-40 md:pb-20">
                    <Container>
                        <div className="max-w-3xl">
                            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                                Legal
                            </p>
                            <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
                                Privacy policy
                            </h1>
                            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                                Any AI for Notion collects as little as possible. This
                                page explains what is collected, why, and how you can ask
                                for it to be deleted.
                            </p>
                            <p className="mt-4 text-sm leading-normal text-muted-foreground">
                                Last updated: September 2, 2026
                            </p>
                        </div>
                    </Container>
                </section>

                <section className="pb-24 md:pb-32">
                    <Container>
                        <div className="max-w-3xl space-y-12 md:space-y-16">
                            <Section id="what-we-collect" title="What we collect">
                                <Paragraph>
                                    The app connects to your Notion workspace through
                                    Notion&rsquo;s official OAuth. When you authorize the
                                    integration, Notion shares an access token that allows
                                    the app to read and write only the pages and databases
                                    you selected. No Notion content is stored on a server:
                                    requests from your AI agent pass through a proxy that
                                    forwards them to the Notion API without persisting
                                    page contents.
                                </Paragraph>
                                <Paragraph>
                                    The app is purchased through the App Store. Payment
                                    details are handled entirely by Apple and never touch
                                    this site. The purchase is tied to your Apple ID, and
                                    the author never receives your email address or payment
                                    information from Apple.
                                </Paragraph>
                                <Paragraph>
                                    No cookies are set. No device identifiers are stored
                                    in your browser.
                                </Paragraph>
                            </Section>

                            <Section id="notion-access" title="Notion access and your AI agent">
                                <Paragraph>
                                    The access token granted through OAuth is used to
                                    answer requests coming from the AI agent you connected,
                                    for example ChatGPT, Claude, or Gemini. The proxy
                                    enforces the permissions you granted in Notion, and you
                                    can revoke access at any time from your Notion
                                    settings, under My connections.
                                </Paragraph>
                                <Paragraph>
                                    When you revoke access, the integration immediately
                                    loses the ability to reach your workspace. The token
                                    itself is deleted from the proxy in line with the
                                    retention rules below.
                                </Paragraph>
                            </Section>

                            <Section id="analytics" title="Analytics">
                                <Paragraph>
                                    This site uses a self-hosted, privacy-friendly
                                    analytics service (Plausible) that records anonymous
                                    pageviews. Plausible does not use cookies, does not
                                    track individual users across sites, does not collect
                                    personal data and does not fingerprint your device.
                                    The data aggregated is limited to total pageviews,
                                    approximate country and the page you landed on. It
                                    cannot be used to identify you.
                                </Paragraph>
                                <Paragraph>
                                    In addition to pageviews, the analytics service
                                    records anonymous custom events that describe how
                                    visitors move through the landing page. These events
                                    track clicks on call to action buttons, which page
                                    sections come into view while scrolling, and when the
                                    App Store badge is clicked. No personally identifiable
                                    information is ever sent to the analytics service.
                                    The events are used only to understand where the page
                                    can be improved.
                                </Paragraph>
                                <Paragraph>
                                    If you prefer to opt out of even this anonymous
                                    counting, most browsers let you block the analytics
                                    script through a content blocker or a &ldquo;do not
                                    track&rdquo; setting. No functionality on this site
                                    depends on the analytics script.
                                </Paragraph>
                            </Section>

                            <Section id="subprocessors" title="Subprocessors">
                                <Paragraph>
                                    The only third-party services that come into contact
                                    with the data described above are:
                                </Paragraph>
                                <ul className="list-disc space-y-3 pl-6 text-base leading-relaxed text-muted-foreground">
                                    <li>
                                        Notion, which provides the OAuth authentication and
                                        the API the app calls to read and write your
                                        workspace.
                                    </li>
                                    <li>
                                        Apple, which processes the App Store purchase. The
                                        author only sees aggregate sales information.
                                    </li>
                                    <li>
                                        The self-hosted analytics service that receives
                                        anonymous pageview events. It never receives your
                                        email address.
                                    </li>
                                    <li>
                                        The hosting provider that serves this website and
                                        processes HTTP requests in transit. Standard
                                        server access logs may be retained briefly for
                                        security and abuse prevention.
                                    </li>
                                </ul>
                                <Paragraph>
                                    No advertising, marketing or data-broker services
                                    receive any data from this site.
                                </Paragraph>
                            </Section>

                            <Section id="retention" title="Retention">
                                <Paragraph>
                                    Notion access tokens are kept only while your
                                    integration is connected, and are deleted when you
                                    revoke access from your Notion settings. No Notion
                                    page content is retained by the proxy.
                                </Paragraph>
                                <Paragraph>
                                    Anonymous analytics data is retained in aggregate and
                                    cannot be traced back to you.
                                </Paragraph>
                            </Section>

                            <Section id="your-rights" title="Your rights">
                                <Paragraph>
                                    You can request information about the data tied to
                                    your Notion integration, ask for it to be corrected,
                                    or ask for it to be deleted at any time. Email{" "}
                                    <a
                                        href={`mailto:${CONTACT_EMAIL}`}
                                        className="underline underline-offset-4 transition-colors hover:text-foreground"
                                    >
                                        {CONTACT_EMAIL}
                                    </a>{" "}
                                    and you will receive a response, typically within a few
                                    days. Revoking the integration from your Notion
                                    settings is the fastest way to remove access.
                                </Paragraph>
                                <Paragraph>
                                    You also have the right to lodge a complaint with
                                    your local data protection authority. This site is
                                    operated from Italy, so the relevant authority is the
                                    Garante per la protezione dei dati personali.
                                </Paragraph>
                            </Section>

                            <Section id="security" title="Security">
                                <Paragraph>
                                    This site and the proxy are served over HTTPS. The
                                    connection to Notion uses Notion&rsquo;s official API
                                    over HTTPS, and the app never asks for permissions
                                    beyond the pages and databases you select during
                                    OAuth.
                                </Paragraph>
                                <Paragraph>
                                    No method of transmission over the internet is fully
                                    secure. While reasonable steps are taken to protect
                                    your data, absolute security cannot be guaranteed.
                                </Paragraph>
                            </Section>

                            <Section id="changes" title="Changes to this policy">
                                <Paragraph>
                                    If the way this site or the app handles data changes,
                                    this page will be updated and the &ldquo;last
                                    updated&rdquo; date above will reflect the change.
                                </Paragraph>
                            </Section>

                            <Section id="contact" title="Contact">
                                <Paragraph>
                                    For any privacy question or request, email{" "}
                                    <a
                                        href={`mailto:${CONTACT_EMAIL}`}
                                        className="underline underline-offset-4 transition-colors hover:text-foreground"
                                    >
                                        {CONTACT_EMAIL}
                                    </a>
                                    .
                                </Paragraph>
                            </Section>
                        </div>
                    </Container>
                </section>
            </main>
            <Footer />
        </div>
    );
}