import { permanentRedirect } from "next/navigation";

export default function PageTwoGateRedirect() {
    permanentRedirect("/research/resume-length-myths");
}
