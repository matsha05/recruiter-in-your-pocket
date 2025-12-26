import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Analytics } from "@vercel/analytics/react";

import { Toaster } from "@/components/ui/sonner";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "@fontsource-variable/fraunces";


export const metadata: Metadata = {
  metadataBase: new URL('https://recruiterinyourpocket.com'),
  title: {
    default: "Recruiter in Your Pocket — Free Resume Review from a Recruiter's Perspective",
    template: "%s | Recruiter in Your Pocket"
  },
  description: "Get recruiter-grade feedback on your resume. See what hiring managers at top companies actually notice in the first 10 seconds.",
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
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        {/* Favicon is handled automatically by icon.tsx */}
      </head>
      <body>
        <AuthProvider>
          {children}
          <Toaster />
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  );
}

