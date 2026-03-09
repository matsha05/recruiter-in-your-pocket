import { notFound } from "next/navigation";
import ChromeWebStoreAssetStudio from "@/components/internal/ChromeWebStoreAssetStudio";

export const dynamic = "force-dynamic";

export default function ChromeWebStoreAssetsPage() {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_INTERNAL_PAGES !== "true") {
    notFound();
  }

  return <ChromeWebStoreAssetStudio />;
}
