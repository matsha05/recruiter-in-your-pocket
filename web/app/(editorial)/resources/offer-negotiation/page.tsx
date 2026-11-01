import { JsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo/metadata";
import { SECTION_NAMES } from "@/lib/seo/site";
import { articleStructuredData } from "@/lib/seo/structured-data";
import OfferNegotiationGuidePage from "../../guides/offer-negotiation/page";

const PATH = "/resources/offer-negotiation";
const description = "How to review a job offer, decide what to ask for, and make a counter the recruiter can take to the hiring manager, with wording you can use.";

export const metadata = pageMetadata({
  path: PATH,
  title: "How to negotiate a job offer",
  description,
  type: "article",
});

export default function OfferNegotiationPage() {
  return (
    <>
      <JsonLd
        data={articleStructuredData({
          path: PATH,
          // The guide's h1.
          headline: "Most offers have some room. Here's how to find it.",
          description,
          trail: [
            { name: SECTION_NAMES["/resources"], path: "/resources" },
            { name: "Offer negotiation", path: PATH },
          ],
        })}
      />
      <OfferNegotiationGuidePage />
    </>
  );
}
