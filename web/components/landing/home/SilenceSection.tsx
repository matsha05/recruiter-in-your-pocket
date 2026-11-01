import styles from "./SilenceSection.module.css";

const APPLICATIONS = [
    { role: "Customer Success Manager", company: "Northwind", status: "No response" },
    { role: "Account Manager", company: "Contoso", status: "No response" },
    { role: "CS Lead", company: "Fabrikam", status: "No response" },
    { role: "Renewals Manager", company: "Tailspin", status: "No response" },
    { role: "Senior CSM", company: "Litware", status: "Viewed · No response" },
];

/** The black hole, named plainly, and the honest turn: not always you, but sometimes one line. */
export function SilenceSection() {
    return (
        <section className={styles.silence} aria-labelledby="silence-title">
            <ul className={styles.list} aria-hidden="true">
                {APPLICATIONS.map((item) => (
                    <li key={item.company}>
                        <span><b>{item.role}</b> · {item.company}</span>
                        <span className={styles.status}>{item.status}</span>
                    </li>
                ))}
            </ul>
            <h2 id="silence-title" className={styles.title}>Not even a reply.</h2>
            <p className={styles.body}>
                Sometimes it&rsquo;s the market, a ghost job, or a stack of other applicants.
                Sometimes it&rsquo;s one line on your resume. <strong>That part you can fix.</strong>
            </p>
        </section>
    );
}
