import Link from "next/link";
import { Wordmark } from "@/components/icons/Wordmark";
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
                    <a href="mailto:support@recruiterinyourpocket.com" className={`focus-ring ${styles.link} ${styles.mail}`}>support@recruiterinyourpocket.com</a>
                </div>
                {FOOTER_NAV.map((group) => (
                    <nav key={group.id} className={styles.column} aria-labelledby={`footer-${group.id}`}>
                        <h2 id={`footer-${group.id}`} className={styles.label}>{group.label}</h2>
                        <ul>
                            {group.links.map((link) => (
                                <li key={link.href}><FooterLink href={link.href}>{link.label}</FooterLink></li>
                            ))}
                            {group.id === "help" ? <li><PrivacyPreferencesButton className={`focus-ring ${styles.link}`} /></li> : null}
                        </ul>
                    </nav>
                ))}
            </div>
            <div className={styles.legal}>
                <p>© 2026 Recruiter in Your Pocket</p>
                <Link href="/purchase/restore" className={`focus-ring ${styles.link}`}>Already paid? Restore access</Link>
            </div>
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
