import { JsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo/metadata";
import { SECTION_NAMES } from "@/lib/seo/site";
import { articleStructuredData } from "@/lib/seo/structured-data";
import TechOfferNegotiationGuidePage from "../../guides/tech-offer-negotiation/page";

const PATH = "/resources/tech-offer-negotiation";
const description = "How to compare base, bonus, equity, vesting, level, and year-one cash in a tech job offer, and choose the one or two changes worth asking for.";

export const metadata = pageMetadata({
  path: PATH,
  title: "How to negotiate a tech offer: base, bonus, equity, level",
  description,
  type: "article",
});

export default function TechOfferNegotiationPage() {
  return (
    <>
      <JsonLd
        data={articleStructuredData({
          path: PATH,
          // The guide's h1.
          headline: "Compare your tech offer year by year.",
          description,
          trail: [
            { name: SECTION_NAMES["/resources"], path: "/resources" },
            { name: "Tech offer negotiation", path: PATH },
          ],
        })}
      />
      <TechOfferNegotiationGuidePage />
    </>
  );
}
