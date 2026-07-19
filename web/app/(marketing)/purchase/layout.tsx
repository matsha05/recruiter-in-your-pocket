import type { Metadata } from "next";
import { PRIVATE_ROUTE_ROBOTS } from "@/lib/seo/privateRouteMetadata";

export const metadata: Metadata = {
  robots: PRIVATE_ROUTE_ROBOTS,
};

export default function PurchaseLayout({ children }: { children: React.ReactNode }) {
  return children;
}
