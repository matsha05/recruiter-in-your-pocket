"use client";

import type { ReactNode } from "react";
import { m as motion, type MotionProps } from "motion/react";
import { cn } from "@/lib/utils";

type DiagramFigureProps = {
  children: ReactNode;
  className?: string;
  label?: string;
};

export function DiagramFigure({ children, className, label }: DiagramFigureProps) {
  return (
    <figure aria-label={label} className={cn("riyp-figure mx-auto my-14 w-full md:my-16", className)}>
      {children}
    </figure>
  );
}

type DiagramFrameProps = MotionProps & {
  children: ReactNode;
  className?: string;
};

export function DiagramFrame({ children, className, ...motionProps }: DiagramFrameProps) {
  return (
    <motion.div className={cn("riyp-diagram-shell", className)} {...motionProps}>
      {children}
    </motion.div>
  );
}

type DiagramHeaderProps = {
  label?: string;
  className?: string;
  rightSlot?: ReactNode;
  children?: ReactNode;
};

export function DiagramHeader({ label, className, rightSlot, children }: DiagramHeaderProps) {
  return (
    <div className={cn("riyp-diagram-head flex items-center justify-between gap-3", className)}>
      {children ?? (
        <span className="riyp-evidence-label text-brand">
          {label}
        </span>
      )}
      {rightSlot ? <div className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground tabular-nums">{rightSlot}</div> : null}
    </div>
  );
}

type DiagramCaptionProps = {
  kicker?: string;
  title?: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
};

export function DiagramCaption({
  kicker,
  title,
  description,
  align = "left",
  className,
}: DiagramCaptionProps) {
  const alignClass = align === "center" ? "text-center" : "text-left";
  return (
    <figcaption className={cn("mt-4 grid gap-1 border-t border-line pt-3 md:grid-cols-[11rem_minmax(0,1fr)] md:gap-x-6", alignClass, className)}>
      {kicker ? <span className="block riyp-figure-kicker">{kicker}</span> : null}
      {title ? (
        <span className="block text-sm font-semibold leading-6 text-foreground">{title}</span>
      ) : null}
      {description ? (
        <span className="block text-xs leading-5 text-muted-foreground md:col-start-2">{description}</span>
      ) : null}
    </figcaption>
  );
}

type DiagramBulletListProps = {
  items: string[];
  dense?: boolean;
  className?: string;
};

export function DiagramBulletList({ items, dense, className }: DiagramBulletListProps) {
  return (
    <ul
      className={cn(
        "list-disc list-outside pl-5 marker:text-brand",
        dense ? "space-y-1" : "space-y-1.5",
        className
      )}
    >
      {items.map((item) => (
        <li key={item} className="text-sm leading-6 text-muted-foreground">
          {item}
        </li>
      ))}
    </ul>
  );
}
