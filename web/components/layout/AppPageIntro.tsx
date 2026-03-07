"use client";

import { cn } from "@/lib/utils";

type AppPageIntroProps = {
  eyebrow?: string;
  title: string;
  description: string;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  anchor?: string;
  className?: string;
};

export function AppPageIntro({
  eyebrow,
  title,
  description,
  meta,
  actions,
  anchor,
  className,
}: AppPageIntroProps) {
  return (
    <section
      data-visual-anchor={anchor}
      className={cn(
        "app-page-intro flex flex-col gap-5 px-5 py-5 md:px-7 md:py-6 lg:flex-row lg:items-end lg:justify-between",
        className
      )}
    >
      <div className="max-w-3xl space-y-3">
        {eyebrow ? (
          <p className="app-page-eyebrow">
            {eyebrow}
          </p>
        ) : null}
        <div className="space-y-2">
          <h1 className="app-page-title">
            {title}
          </h1>
          <p className="app-page-description">
            {description}
          </p>
        </div>
        {meta ? <div className="flex flex-wrap items-center gap-2.5">{meta}</div> : null}
      </div>

      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2.5">{actions}</div> : null}
    </section>
  );
}
