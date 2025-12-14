import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Geist } from "next/font/google";
import { Newsreader } from "next/font/google";
import { Geist } from "next/font/google";
import { Newsreader } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

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
    <html lang="en" className={`${geistSans.variable} ${newsreader.variable}`}>
      <head>
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


