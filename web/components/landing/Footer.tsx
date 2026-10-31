import Link from "next/link";
import { Wordmark } from "@/components/icons";
import { FOOTER_NAV } from "@/lib/navigation";
import styles from "./Footer.module.css";
import { PrivacyPreferencesButton } from "@/components/privacy/PrivacyPreferencesButton";

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.inner}>
                <div className={styles.about}>
                    <Link href="/" aria-label="Recruiter in Your Pocket home" className={`focus-ring ${styles.brand}`}>
                        <Wordmark />
                    </Link>
                    <p className={styles.description}>
                        See what a recruiter sees before you apply. Your first report is free.
                    </p>
                    <p className={styles.support}>
                        Support:{" "}
                        <a href="mailto:support@recruiterinyourpocket.com" className={`focus-ring ${styles.link}`}>support@recruiterinyourpocket.com</a>
                    </p>
                </div>
                <nav className={styles.navigation} aria-label="Footer navigation">
                    {FOOTER_NAV.pillLinks.map((link) => (
                        <FooterLink key={link.href} href={link.href}>{link.label}</FooterLink>
                    ))}
                    <FooterLink href="/trust">Trust</FooterLink>
                    {FOOTER_NAV.legalLinks.map((link) => (
                        <FooterLink key={link.href} href={link.href}>{link.label}</FooterLink>
                    ))}
                    <PrivacyPreferencesButton className={`focus-ring ${styles.link}`} />
                </nav>
            </div>
            <p className={styles.copyright}>© 2026 Recruiter in Your Pocket</p>
        </footer>
    );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className={`focus-ring ${styles.link}`}
        >
            {children}
        </Link>
    );
}
