import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PRIVATE_ROUTE_ROBOTS } from "@/lib/seo/privateRouteMetadata";

export const metadata: Metadata = {
  robots: PRIVATE_ROUTE_ROBOTS,
};

export default function SignInRedirectPage() {
  redirect("/auth");
}
