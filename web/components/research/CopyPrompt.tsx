"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "@phosphor-icons/react";
import styles from "./CopyPrompt.module.css";

/**
 * A prompt the reader can paste into an AI assistant, shown in full and copied with one button (Nov 10, 2026: Matt
 * asked for one on the referral article). The text is ours, so the label says so.
 */
export function CopyPrompt({ label, text }: { label: string; text: string }) {
    const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setState("copied");
        } catch {
            setState("failed");
        }
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setState("idle"), 2400);
    };

    return (
        <figure className={`not-prose ${styles.block}`} aria-labelledby="copy-prompt-label">
            <div className={styles.head}>
                <figcaption id="copy-prompt-label" className={styles.label}>{label}</figcaption>
                <button type="button" onClick={copy} className={`focus-ring ${styles.button}`}>
                    {state === "copied" ? <Check aria-hidden="true" weight="bold" /> : <Copy aria-hidden="true" />}
                    {state === "copied" ? "Copied" : "Copy the prompt"}
                </button>
            </div>
            <pre className={styles.text}>{text}</pre>
            <p className={styles.status} role="status" aria-live="polite">
                {state === "failed" ? "Couldn’t copy. Select the text above and copy it instead." : ""}
            </p>
        </figure>
    );
}
