import Link from "next/link";
import { Wordmark } from "@/components/icons/Wordmark";
import { FOOTER_LINKS } from "@/lib/navigation";
import styles from "./Footer.module.css";
import { PrivacyPreferencesButton } from "@/components/privacy/PrivacyPreferencesButton";

/**
 * The footer (cut down Nov 10, 2026: Matt, "its SO MUCH TEXT"): the wordmark and one row of the links the header
 * doesn't carry, then one quiet line for the copyright, support, privacy choices and restoring a purchase. It sits on
 * the site's one column.
 */
export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.inner}>
                <Link href="/" aria-label="Recruiter in Your Pocket home" className={`focus-ring ${styles.brand}`}>
                    <Wordmark />
                </Link>
                <nav aria-label="Footer">
                    <ul className={styles.links}>
                        {FOOTER_LINKS.map((link) => (
                            <li key={link.href}><Link href={link.href} className={`focus-ring ${styles.link}`}>{link.label}</Link></li>
                        ))}
                    </ul>
                </nav>
            </div>
            <div className={styles.legal}>
                <p>© 2026 Recruiter in Your Pocket</p>
                <ul className={styles.small}>
                    <li><a href="mailto:support@recruiterinyourpocket.com" className={`focus-ring ${styles.link}`}>support@recruiterinyourpocket.com</a></li>
                    <li><PrivacyPreferencesButton className={`focus-ring ${styles.link}`} /></li>
                    <li><Link href="/purchase/restore" className={`focus-ring ${styles.link}`}>Restore a purchase</Link></li>
                </ul>
            </div>
        </footer>
    );
}
