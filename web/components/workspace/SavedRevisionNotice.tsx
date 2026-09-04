import Link from "next/link";
import { SpinnerGap, WarningCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

type Props = {
  loading: boolean;
  error: string | null;
  signedOut?: boolean;
  signInHref?: string;
  onRetry: () => void;
  onNewReport: () => void;
};

export default function SavedRevisionNotice({ loading, error, signedOut, signInHref, onRetry, onNewReport }: Props) {
  if (!loading && !error) return null;

  return (
    <div className="mb-6 border-l-2 border-cyan-bright bg-surface-sky px-4 py-4" role={error ? "alert" : "status"}>
      <div className="flex items-start gap-3">
        {loading ? <SpinnerGap className="mt-0.5 size-4 shrink-0 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <WarningCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />}
        <div>
          <p className="text-sm font-medium text-foreground">{loading ? "Loading your original report" : "Comparison unavailable"}</p>
          <p className="mt-1 text-sm text-muted-foreground">{loading ? "Your next report will be compared with this saved report." : error}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
              {error && (signedOut && signInHref ? (
                <Link href={signInHref} className="inline-flex min-h-11 items-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90">Sign in</Link>
              ) : (
                <Button type="button" variant="outline" onClick={onRetry} className="min-h-11 border-foreground px-4">Try again</Button>
              ))}
            <Button type="button" variant="outline" onClick={onNewReport} className="min-h-11 border-foreground px-4">Start a new report</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
