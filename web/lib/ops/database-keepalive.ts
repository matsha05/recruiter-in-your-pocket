/**
 * A daily read that keeps the Supabase project from pausing for inactivity.
 *
 * It sends the same anonymous, read-only requests the retired GitHub keepalive
 * sent: one `select=id&limit=1` per table with the public key. Anyone can
 * already make these requests with the key the browser bundle carries, so the
 * route that calls this adds no capability; CRON_SECRET, when set, still
 * limits it to Vercel's scheduler.
 */
export const KEEPALIVE_TABLES = ["reports", "saved_jobs", "cases"] as const;

export type KeepaliveTableResult = {
  table: (typeof KEEPALIVE_TABLES)[number];
  status: number | null;
};

export type KeepaliveResult = {
  ok: boolean;
  tables: KeepaliveTableResult[];
};

export async function pingDatabase(
  config: { url: string; key: string },
  fetchImpl: typeof fetch = fetch
): Promise<KeepaliveResult> {
  const tables = await Promise.all(
    KEEPALIVE_TABLES.map(async (table): Promise<KeepaliveTableResult> => {
      const endpoint = new URL(`/rest/v1/${table}`, config.url);
      endpoint.searchParams.set("select", "id");
      endpoint.searchParams.set("limit", "1");
      try {
        // The apikey header alone selects the anonymous role for both the
        // legacy anon JWT and the newer publishable key.
        const response = await fetchImpl(endpoint, {
          headers: { apikey: config.key },
          cache: "no-store",
        });
        return { table, status: response.status };
      } catch {
        return { table, status: null };
      }
    })
  );

  return {
    ok: tables.every(({ status }) => status !== null && status >= 200 && status < 300),
    tables,
  };
}

/** Vercel sends `Authorization: Bearer <CRON_SECRET>` when the project defines one. */
export function cronRequestAllowed(authorization: string | null, cronSecret: string | undefined): boolean {
  if (!cronSecret) return true;
  return authorization === `Bearer ${cronSecret}`;
}
