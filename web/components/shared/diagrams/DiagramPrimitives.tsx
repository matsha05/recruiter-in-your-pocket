"use client";

import type { ReactNode } from "react";
import { motion, type MotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type DiagramFigureProps = {
  children: ReactNode;
  className?: string;
};

export function DiagramFigure({ children, className }: DiagramFigureProps) {
  return (
    <figure className={cn("riyp-figure w-full mx-auto my-10 select-none", className)}>
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
        <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
          {label}
        </span>
      )}
      {rightSlot ? <div className="text-label-mono text-slate-400">{rightSlot}</div> : null}
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
    <figcaption className={cn("mt-4 space-y-1", alignClass, className)}>
      {kicker ? <span className="block riyp-figure-kicker">{kicker}</span> : null}
      {title ? (
        <span className="block text-sm text-slate-700 font-medium">{title}</span>
      ) : null}
      {description ? (
        <span className="block text-xs text-slate-500">{description}</span>
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
        "list-disc list-outside pl-5 marker:text-slate-400",
        dense ? "space-y-1" : "space-y-1.5",
        className
      )}
    >
      {items.map((item) => (
        <li key={item} className="text-sm leading-6 text-slate-700">
          {item}
        </li>
      ))}
    </ul>
  );
}
