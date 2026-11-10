import type { Icon } from "@phosphor-icons/react";
import { Eye, Funnel, Handshake, IdentificationCard, TrendUp, UsersThree } from "@phosphor-icons/react/dist/ssr";

/** One Phosphor icon per belief, regular weight, in ink (Matt chose Phosphor over Iconoir, Radix and Tabler, Nov 10, 2026).
 *  The icon names the subject; it never carries a pen color, since pillars are named, not colored. */
const ICONS: Record<string, Icon> = {
    story: IdentificationCard,
    impact: TrendUp,
    read: Eye,
    ats: Funnel,
    referrals: UsersThree,
    offer: Handshake,
};

export function PillarIcon({ id, className }: { id: string; className?: string }) {
    const Glyph = ICONS[id];
    if (!Glyph) throw new Error(`No icon for the "${id}" belief (PillarIcon.tsx).`);
    return <Glyph className={className} weight="regular" aria-hidden="true" />;
}
