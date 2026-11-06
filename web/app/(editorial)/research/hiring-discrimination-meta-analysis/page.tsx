import { permanentRedirect } from "next/navigation";

// Removed on November 6, 2026 (Matt): the site does not publish race and discrimination research.
export default function HiringDiscriminationRedirect() {
    permanentRedirect("/research");
}
