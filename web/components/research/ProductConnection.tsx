interface ProductConnectionItem {
    feature: string;
    because: string;
}

interface ProductConnectionProps {
    title?: string;
    connections: ProductConnectionItem[];
}

export default function ProductConnection({
    title = "What this changes in RIYP",
    connections,
}: ProductConnectionProps) {
    return (
        <div className="product-connection-enhanced">
            <h3 className="product-connection-title">
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                </svg>
                {title}
            </h3>
            <div className="product-connection-list">
                {connections.map((item, i) => (
                    <div key={i} className="product-connection-item">
                        <span className="product-connection-feature">{item.feature}</span>
                        <span className="product-connection-because">{item.because}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
