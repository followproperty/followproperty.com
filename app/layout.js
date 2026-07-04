import { Geist, Geist_Mono, Instrument_Sans, DM_Sans } from "next/font/google";
import "./globals.css";
import FloatingContactButtons from "@/components/ui/FloatingContactButtons";
import { ToastProvider } from "@/context/ToastContext";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://www.followproperty.com"),
  title: "FollowProperty - India's Property Intelligence Platform",
  description: "Monitor value, builder risks, legal alerts, RERA delay warnings, and local circle rates in one workspace. Built for serious property investors.",
  icons: {
    icon: "/favicon.svg",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  alternates: {
    canonical: "https://www.followproperty.com",
  },
  openGraph: {
    title: "FollowProperty - India's Property Intelligence Platform",
    description: "Monitor value, builder risks, legal alerts, RERA delay warnings, and local circle rates in one workspace.",
    url: "https://www.followproperty.com",
    siteName: "FollowProperty",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FollowProperty - India's Property Intelligence Platform",
    description: "Monitor value, builder risks, legal alerts, RERA delay warnings, and local circle rates in one workspace.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": "https://www.followproperty.com/#webapp",
        "name": "FollowProperty",
        "url": "https://www.followproperty.com",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "All",
        "description": "India's Property Intelligence Platform for monitoring property value, builder risks, RERA timelines, and local circle rates.",
        "browserRequirements": "Requires JavaScript. Requires HTML5.",
        "genre": "Real Estate Technology",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "INR"
        }
      },
      {
        "@type": "Organization",
        "@id": "https://www.followproperty.com/#organization",
        "name": "FollowProperty",
        "url": "https://www.followproperty.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.followproperty.com/logo.svg"
        },
        "sameAs": [
          "https://x.com/followproperty",
          "https://www.linkedin.com/company/followproperty"
        ]
      }
    ]
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSans.variable} ${dmSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Structured Data (JSON-LD) for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Google Analytics (gtag.js) */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());

                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `}
            </Script>
          </>
        )}
      </head>
      <body className="min-h-full flex flex-col overflow-x-hidden max-w-full">
        <ToastProvider>
          {children}
        </ToastProvider>
        <FloatingContactButtons />
      </body>
    </html>
  );
}

