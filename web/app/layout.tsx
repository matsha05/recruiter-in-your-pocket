import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";

import { Toaster } from "@/components/ui/sonner";
import { GeistSans } from "geist/font/sans";

export const metadata: Metadata = {
  title: "Recruiter in Your Pocket — Free Resume Review from a Recruiter's Perspective",
  description: "Get recruiter-grade feedback on your resume. See what hiring managers at top companies actually notice in the first 10 seconds."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,200..800;1,200..800&display=swap"
          rel="stylesheet"
        />
        {/* Favicon is handled automatically by icon.tsx */}
      </head>
      <body>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}

