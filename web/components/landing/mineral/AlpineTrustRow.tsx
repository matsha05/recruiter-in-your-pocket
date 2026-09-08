import styles from "./AlpineTrustRow.module.css";

const brands = [
    { name: "Google", className: styles.google },
    { name: "Meta", className: styles.meta },
    { name: "Apple", className: styles.apple },
    { name: "Amazon", className: styles.amazon },
    { name: "Microsoft", className: styles.microsoft },
    { name: "Bain & Company", className: styles.bain },
] as const;

/** Reference artwork used for the local visual prototype. */
export function AlpineTrustRow() {
    return (
        <section className={styles.row} aria-labelledby="alpine-trust-label">
            <div className={styles.inner}>
                <p id="alpine-trust-label" className={styles.heading}>Trusted by people at</p>
                <ul className={styles.logos} aria-label="Companies">
                    {brands.map((brand) => (
                        <li key={brand.name} className={brand.className}>
                            <span className={styles.logo} role="img" aria-label={brand.name} />
                        </li>
                    ))}
                </ul>
                <p className={styles.more}>And many more</p>
            </div>
        </section>
    );
}
