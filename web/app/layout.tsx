import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { ToasterLauncher } from "@/components/ToasterLauncher";
import { CommandPaletteLauncher } from "@/components/CommandPaletteLauncher";
import { AnalyticsLifecycle } from "@/components/privacy/AnalyticsLifecycle";
import { PageStatistics } from "@/components/privacy/PageStatistics";
import { PrivacyControls } from "@/components/privacy/PrivacyControls";
import { JsonLd } from "@/components/seo/JsonLd";
import { siteStructuredData } from "@/lib/seo/site";

export const metadata: Metadata = {
  metadataBase: new URL('https://www.recruiterinyourpocket.com'),
  title: {
    default: "Recruiter in Your Pocket | Free Resume Report from a Recruiter's Perspective",
    template: "%s | Recruiter in Your Pocket"
  },
  description: "Get a free recruiter report on your resume. See what stands out first, what gets missed, and what to fix next.",
  // Example resumes print a placeholder address; iOS would otherwise turn it into a link.
  formatDetection: { email: false, address: false, telephone: false },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Recruiter in Your Pocket',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/fonts/schibsted-grotesk/SchibstedGrotesk-Variable.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/literata/Literata-Variable.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        {/* Favicon is handled automatically by icon.tsx */}
        {/* Who publishes the site, on every page; the homepage adds the founder and the product. */}
        <JsonLd data={siteStructuredData} />
      </head>
      <body>
        <AppProviders>
          <AnalyticsLifecycle />
          {children}
          <CommandPaletteLauncher />
          <ToasterLauncher />
          <PrivacyControls />
          {/* Only the live site reports page statistics; previews, local runs, and tests stay quiet. */}
          {process.env.VERCEL_ENV === "production" ? <PageStatistics /> : null}
        </AppProviders>
      </body>
    </html>
  );
}
