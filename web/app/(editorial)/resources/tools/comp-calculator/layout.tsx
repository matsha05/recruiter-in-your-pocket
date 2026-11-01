import { JsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo/metadata";
import { SECTION_NAMES, breadcrumbStructuredData } from "@/lib/seo/site";

const PATH = "/resources/tools/comp-calculator";

export const metadata = pageMetadata({
  path: PATH,
  title: "Job offer comparison calculator: salary, bonus, equity",
  description: "Compare up to five job offers, including your current job, over four years: base salary, target bonus, modeled equity, vesting, and one-time pay.",
});

export default function CompensationCalculatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          ...breadcrumbStructuredData([
            { name: SECTION_NAMES["/resources"], path: "/resources" },
            { name: "Offer calculator", path: PATH },
          ]),
        }}
      />
      {children}
    </>
  );
}
