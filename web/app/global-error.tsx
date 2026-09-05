"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-paper text-foreground">
        <main className="flex min-h-screen items-center px-5 py-16 md:px-8">
          <section className="mx-auto w-full max-w-[72rem] border-y border-line py-10 md:py-16" aria-labelledby="global-error-title">
            <p className="text-xs font-semibold uppercase riyp-track-010 text-brand">Recruiter in Your Pocket</p>
            <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,1fr)_18rem] md:items-end">
              <div>
                <h1 id="global-error-title" className="exception-page-title max-w-[44rem] font-display riyp-weight-620 text-foreground riyp-stretch-91">
                  We couldn&apos;t load the app.
                </h1>
                <p className="mt-5 max-w-[38rem] text-lg leading-8 text-muted-foreground">
                  Try again, or open your workspace in a new page. If this keeps happening, contact support and include the error reference below if one is shown.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button type="button" onClick={reset} className="focus-ring inline-flex min-h-12 items-center justify-center bg-foreground px-5 py-3 text-sm font-semibold text-background">
                  Try loading again
                </button>
                <a href="/workspace" className="focus-ring inline-flex min-h-12 items-center justify-center border border-foreground bg-paper px-5 py-3 text-sm font-semibold text-foreground">
                  Open my workspace
                </a>
                <a href="mailto:support@recruiterinyourpocket.com" className="focus-ring inline-flex min-h-12 items-center justify-center px-5 py-3 text-sm font-semibold text-foreground underline underline-offset-4">
                  Contact support
                </a>
              </div>
            </div>
            {error.digest ? <p className="mt-8 font-mono text-xs text-muted-foreground">Error reference {error.digest}</p> : null}
          </section>
        </main>
      </body>
    </html>
  );
}
