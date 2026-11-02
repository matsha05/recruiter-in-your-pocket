import { cn } from "@/lib/utils";
import styles from "./FictionalTag.module.css";

/** Marks an example built on a made-up candidate, so no one mistakes it for a real report or result. */
export function FictionalTag({ className }: { className?: string }) {
    return <p className={cn(styles.tag, className)}>Fictional example</p>;
}
