import Link from "next/link";

export default function Footer() {
    return (
        <footer className="py-12 px-6 border-t border-subtle bg-surface">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">Made with care in Boulder, CO 🤍</p>
                <div className="flex items-center gap-4">
                    <Link href="/terms" className="text-sm text-muted-foreground hover:text-brand transition-colors">Terms</Link>
                    <span className="text-muted-foreground">·</span>
                    <Link href="/privacy" className="text-sm text-muted-foreground hover:text-brand transition-colors">Privacy</Link>
                    <span className="text-muted-foreground">·</span>
                    <Link href="/trust" className="text-sm text-muted-foreground hover:text-brand transition-colors">Trust</Link>
                    <span className="text-muted-foreground">·</span>
                    <Link href="/research" className="text-sm text-muted-foreground hover:text-brand transition-colors">Research Library</Link>
                </div>
            </div>
        </footer>
    );
}
