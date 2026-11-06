"use client";

import { Button } from "@/components/ui/button";
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
            <p className="text-xs font-semibold text-brand">Recruiter in Your Pocket</p>
            <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,1fr)_18rem] md:items-end">
              <div>
                <h1 id="global-error-title" className="max-w-[16ch] font-display text-headline text-foreground">
                  We couldn&apos;t load the app.
                </h1>
                <p className="mt-5 max-w-[38rem] text-lg text-muted-foreground">
                  Our bad. Something broke on our end. If it keeps happening, email support and include the error reference below, if you see one.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Button type="button" onClick={reset}>
                  Try loading again
                </Button>
                <Button asChild variant="secondary">
                  <a href="/workspace">Open my workspace</a>
                </Button>
                <Button asChild variant="quiet">
                  <a href="mailto:support@recruiterinyourpocket.com">Contact support</a>
                </Button>
              </div>
            </div>
            {error.digest ? <p className="mt-8 font-mono text-xs text-muted-foreground">Error reference {error.digest}</p> : null}
          </section>
        </main>
      </body>
    </html>
  );
}
