import Link from "next/link";
import { Wordmark } from "@/components/icons";
import { FOOTER_NAV } from "@/lib/navigation";
import styles from "./Footer.module.css";

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.inner}>
                <div className={styles.about}>
                    <Link href="/" aria-label="Recruiter in Your Pocket home" className={`focus-ring ${styles.brand}`}>
                        <Wordmark />
                    </Link>
                    <p className={styles.description}>
                        See what recruiters are likely to notice before you apply. Start free, save your report if it helps, and add the job description when you want more specific feedback.
                    </p>
                    <p className={styles.support}>
                        Support:{" "}
                        <FooterLink href="/support">support@recruiterinyourpocket.com</FooterLink>
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
