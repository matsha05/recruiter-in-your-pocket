interface ProductConnectionItem {
    feature: string;
    because: string;
}

interface ProductConnectionProps {
    title?: string;
    connections: ProductConnectionItem[];
}

/**
 * ProductConnection - RIYP feature mapping
 * 
 * Editorial design: Inline prefixes, no decorative icons.
 * Allowed to have background container per design rules.
 */
export default function ProductConnection({
    title = "What this changes in RIYP",
    connections,
}: ProductConnectionProps) {
    return (
        <div className="product-connection">
            <h3 className="product-connection-title">{title}</h3>
            <div className="product-connection-list">
                {connections.map((item, i) => (
                    <p key={i} className="product-connection-item">
                        <strong>{item.feature}</strong> {item.because}
                    </p>
                ))}
            </div>
        </div>
    );
}
