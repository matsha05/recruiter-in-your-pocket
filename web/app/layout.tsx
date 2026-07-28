import type { Metadata } from "next";
import "@fontsource-variable/instrument-sans/standard.css";
import "@fontsource-variable/space-grotesk";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { Toaster } from "@/components/ui/sonner";
import { CommandPalette } from "@/components/CommandPalette";

export const metadata: Metadata = {
  metadataBase: new URL('https://www.recruiterinyourpocket.com'),
  title: {
    default: "Recruiter in Your Pocket | Free Resume Report from a Recruiter's Perspective",
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
        {/* Favicon is handled automatically by icon.tsx */}
      </head>
      <body>
        <AppProviders>
          {children}
          <CommandPalette />
          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
}
