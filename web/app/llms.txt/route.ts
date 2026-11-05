import { comparisons, formatChecked } from "@/components/compare/comparisons";
import { llmsText } from "@/lib/seo/llms";

// Built once at deploy time from the same data the pages render (lib/seo/llms.ts).
export const dynamic = "force-static";

export function GET() {
  return new Response(llmsText({ comparisons, pricesRead: formatChecked() }), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
