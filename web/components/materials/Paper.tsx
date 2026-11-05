import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "@/lib/utils";
import styles from "./Paper.module.css";

type PaperProps<T extends ElementType> = {
    as?: T;
    /** `strip`: one line of a document. `page`: a whole sheet. `plain`: the material alone, for a layout to size. */
    kind?: "strip" | "page" | "plain";
    /** A sheet that sits in a pile has the hairline edge and no shadow. */
    flat?: boolean;
    className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className">;

/**
 * Paper (Nov 4, 2026): the site's first material. Off-white, a 0.5px hairline edge, a soft shadow, and inside
 * it the document's own face. Use it only for a real document or a real line from one, never as a card.
 */
export function Paper<T extends ElementType = "div">({ as, kind = "plain", flat = false, className, ...rest }: PaperProps<T>) {
    const Tag = (as ?? "div") as ElementType;
    return <Tag className={cn(styles.sheet, kind === "strip" && styles.strip, kind === "page" && styles.page, flat && styles.flat, className)} {...rest} />;
}
