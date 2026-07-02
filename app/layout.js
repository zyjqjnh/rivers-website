import "./globals.css";
import { JsonLd } from "@/components/JsonLd";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ANRIVERS RF Control — Wireless Control, Engineered to Fit",
    template: "%s | ANRIVERS RF Control",
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: "ANRIVERS RF Control — Wireless Control, Engineered to Fit",
    description: SITE_DESCRIPTION,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "ANRIVERS RF Control — Wireless Control, Engineered to Fit",
    description: SITE_DESCRIPTION,
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
  },
};

export default function RootLayout({ children }) {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
  };

  return (
    <html lang="en">
      <body>
        <JsonLd data={organization} />
        {children}
      </body>
    </html>
  );
}
