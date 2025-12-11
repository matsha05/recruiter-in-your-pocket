import Link from "next/link";

export default function Footer() {
    return (
        <footer className="py-8 px-6 text-center text-sm text-muted border-t border-subtle">
            <p className="mb-2">Made with care in Boulder, CO 🤍</p>
            <div className="flex items-center justify-center gap-2">
                <Link href="/terms" className="hover:text-brand underline transition-colors">Terms</Link>
                <span>·</span>
                <Link href="/privacy" className="hover:text-brand underline transition-colors">Privacy</Link>
                <span>·</span>
                <Link href="/research" className="hover:text-brand underline transition-colors">Hiring Research</Link>
            </div>
        </footer>
    );
}
