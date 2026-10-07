import Script from "next/script";

/**
 * Privacy friendly analytics placeholder. Set NEXT_PUBLIC_PLAUSIBLE_DOMAIN to enable Plausible
 * (cookie free, no consent banner needed). Nothing loads when the variable is empty.
 */
export default function Analytics() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (!domain) return null;
  return (
    <Script
      defer
      data-domain={domain}
      src="https://plausible.io/js/script.js"
      strategy="afterInteractive"
    />
  );
}
