import type { Metadata } from "next";

// No title here: a production 404 renders this layout's metadata, so only the robots rule lives at this level.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function SystemLabLayout({ children }: { children: React.ReactNode }) {
  return children;
}
