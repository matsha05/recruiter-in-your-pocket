import { createElement } from "react";

export function RewriteEnhancementNote({ note, className, label = "Before you use this" }: { note?: string; className?: string; label?: string }) {
  const normalized = note?.trim();
  if (!normalized) return null;

  return createElement(
    "aside",
    {
      className: ["border-l-2 border-brand/30 pl-4", className].filter(Boolean).join(" "),
      "data-report-enhancement-note": "true",
    },
    createElement(
      "p",
      { className: "text-[11px] font-semibold uppercase riyp-track-015 text-brand" },
      label,
    ),
    createElement(
      "p",
      { className: "mt-2 text-sm leading-6 text-foreground/75" },
      normalized,
    ),
  );
}
