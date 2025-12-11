import Link from "next/link";

export default function Footer() {
    return (
        <footer className="py-8 px-6 text-center text-sm text-gray-500 border-t border-gray-200">
            <p className="mb-2">Made with care in Boulder, CO 🤍</p>
            <div className="flex items-center justify-center gap-2">
                <Link href="/terms" className="hover:text-indigo-600 underline transition-colors">Terms</Link>
                <span>·</span>
                <Link href="/privacy" className="hover:text-indigo-600 underline transition-colors">Privacy</Link>
                <span>·</span>
                <Link href="/research" className="hover:text-indigo-600 underline transition-colors">Hiring Research</Link>
            </div>
        </footer>
    );
}
