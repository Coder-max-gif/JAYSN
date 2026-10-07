import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "@/styles/global.css";
import { company } from "@/content/company";
import { home } from "@/content/home";
import Providers from "@/components/layout/Providers";
import Shell from "@/components/layout/Shell";
import Footer from "@/components/layout/Footer";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import JsonLd from "@/components/ui/JsonLd";
import Analytics from "@/components/layout/Analytics";

const display = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--ff-display",
  display: "swap",
});
const body = Hanken_Grotesk({ subsets: ["latin"], variable: "--ff-body", display: "swap" });
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--ff-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(company.siteUrl),
  title: {
    default: `${company.legalName.value} | ${home.meta.title}`,
    template: `%s | ${company.wordmark}`,
  },
  description: home.meta.description,
  applicationName: company.wordmark,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: company.legalName.value,
    locale: "en_IN",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#0c0f0b",
  colorScheme: "dark",
};

/**
 * Runs before paint: marks JS as available, applies the saved reduce motion choice and skips
 * the preloader on repeat visits in the same session. Avoids a flash of wrong state.
 */
const bootScript = `(function(){try{var d=document.documentElement;d.classList.add('js');var m=localStorage.getItem('jaysn-motion');if(m){d.setAttribute('data-motion',m)}else if(matchMedia('(prefers-reduced-motion: reduce)').matches){d.setAttribute('data-motion','reduce')}if(sessionStorage.getItem('jaysn-visited')){d.classList.add('no-preloader')}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-IN"
      data-theme="soil"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        <Providers>
          <Shell footer={<Footer />}>{children}</Shell>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
