import Script from "next/script";

export default function PlausibleAnalytics() {
    return (
        <>
            <Script
                defer
                data-domain="anyaifornotion.com"
                src="https://analytics3.ricu.it/js/script.file-downloads.hash.outbound-links.pageview-props.revenue.tagged-events.js"
            />
            <Script id="plausible-setup">
                {`window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }`}
            </Script>
        </>
    );
}