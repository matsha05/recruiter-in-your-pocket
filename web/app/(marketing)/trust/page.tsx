import TrustClient from "@/components/legal/TrustClient";

export const metadata = {
    title: "Trust and Security",
    description: "How we handle data, security, billing controls, and product methodology.",
    alternates: { canonical: "/trust" },
};

export default function TrustPage() {
    return <TrustClient />;
}
