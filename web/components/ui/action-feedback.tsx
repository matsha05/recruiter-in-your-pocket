"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import styles from "./action-feedback.module.css";

type FeedbackContent = {
  label: ReactNode;
  icon?: ReactNode;
};

type ActionFeedbackProps = {
  state: string;
  states: Record<string, FeedbackContent>;
  className?: string;
  announce?: boolean;
};

/** Keeps an action's footprint steady while its real status changes. */
export function ActionFeedback({ state, states, className, announce = true }: ActionFeedbackProps) {
  const current = states[state];
  if (!current) return null;

  return (
    <span
      className={cn(styles.root, className)}
      data-feedback-state={state}
      aria-live={announce ? "polite" : undefined}
      aria-atomic={announce || undefined}
    >
      {Object.entries(states).map(([name, content]) => (
        <span key={name} className={styles.reserve} aria-hidden="true">
          {content.icon && <span className={styles.icon}>{content.icon}</span>}
          <span className={styles.label}>{content.label}</span>
        </span>
      ))}
      <span key={state} className={styles.current}>
        {current.icon && <span className={styles.icon} aria-hidden="true">{current.icon}</span>}
        <span className={styles.label}>{current.label}</span>
      </span>
    </span>
  );
}
