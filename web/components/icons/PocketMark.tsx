import { ReadCvLogo } from "@phosphor-icons/react/dist/ssr";

/** Compact recruiter-mark monogram, backed by the shared icon library. */

interface IconProps {
    className?: string;
    size?: number;
}

export function PocketMark({ className = "", size = 24 }: IconProps) {
    return <ReadCvLogo aria-hidden="true" className={className} size={size} weight="regular" />;
}
