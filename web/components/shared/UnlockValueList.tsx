import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface UnlockValueListProps {
  items: string[];
  className?: string;
  dense?: boolean;
  tone?: "premium" | "brand";
}

export function UnlockValueList({
  items,
  className,
  dense = false,
  tone = "premium"
}: UnlockValueListProps) {
  if (!items || items.length === 0) return null;

  return (
    <ul
      className={cn(
        "space-y-2",
        dense ? "text-xs" : "text-sm",
        className
      )}
    >
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-muted-foreground">
          <Check
            className={cn(
              "mt-0.5 h-3.5 w-3.5 shrink-0",
              tone === "premium" ? "text-premium" : "text-brand"
            )}
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
