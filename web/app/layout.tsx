import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { Analytics } from "@vercel/analytics/next";

import { Toaster } from "@/components/ui/sonner";
import { CommandPalette } from "@/components/CommandPalette";
import { isLaunchFlagEnabled } from "@/lib/launch/flags";
const sentient = localFont({
  src: [
    {
      path: "../public/fonts/sentient/sentient-400.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/sentient/sentient-500.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/sentient/sentient-700.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-sentient",
  display: "swap",
});

const satoshi = localFont({
  src: [
    {
      path: "../public/fonts/satoshi/satoshi-400.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/satoshi/satoshi-500.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/satoshi/satoshi-700.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-satoshi",
  display: "swap",
});


export const metadata: Metadata = {
  metadataBase: new URL('https://recruiterinyourpocket.com'),
  title: {
    default: "Recruiter in Your Pocket — Free Resume Report from a Recruiter's Perspective",
    template: "%s | Recruiter in Your Pocket"
  },
  description: "Get a free recruiter report on your resume. See what stands out first, what gets missed, and what to fix next.",
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
    images: [{
      url: '/assets/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Recruiter in Your Pocket - See what recruiters see',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/assets/og-image.png'],
  },
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sentient.variable} ${satoshi.variable}`}>
      <head>
        {/* Favicon is handled automatically by icon.tsx */}
      </head>
      <body>
        <AppProviders>
          {children}
          <CommandPalette />
          <Toaster />
          {isLaunchFlagEnabled("analytics") ? <Analytics /> : null}
        </AppProviders>
      </body>
    </html>
  );
}
