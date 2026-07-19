import { notFound } from "next/navigation";
import SystemLab from "@/components/internal/system-lab/SystemLab";

export const dynamic = "force-dynamic";

export default function SystemLabPage() {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_INTERNAL_PAGES !== "true") {
    notFound();
  }

  return <SystemLab />;
}
