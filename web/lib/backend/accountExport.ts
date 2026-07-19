type AdminClient = any;

export type AccountExportPayload = {
  exported_at: string;
  user: {
    id: string;
    email: string | null;
    first_name: string | null;
  };
  data: {
    reports: any[];
    passes: any[];
    user_usage: any[];
    user_profiles: any[];
    saved_jobs: any[];
    billing_receipts: any[];
  };
  warnings: Array<{ table: string; error: string }>;
};

const EXPORT_TABLES = ["reports", "passes", "user_usage", "user_profiles", "saved_jobs", "billing_receipts"] as const;
const EXPORT_PAGE_SIZE = 500;
const MAX_EXPORT_ROWS_PER_TABLE = 50_000;

const EXPORT_STABLE_KEYS: Record<(typeof EXPORT_TABLES)[number], string> = {
  reports: "id",
  passes: "id",
  user_usage: "user_id",
  user_profiles: "id",
  saved_jobs: "id",
  billing_receipts: "id",
};

async function readAllRows(
  admin: AdminClient,
  table: (typeof EXPORT_TABLES)[number],
  userId: string,
): Promise<any[]> {
  const rows: any[] = [];

  for (let from = 0; from < MAX_EXPORT_ROWS_PER_TABLE; from += EXPORT_PAGE_SIZE) {
    const { data, error } = await admin
      .from(table)
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .order(EXPORT_STABLE_KEYS[table], { ascending: true })
      .range(from, from + EXPORT_PAGE_SIZE - 1);

    if (error) {
      throw new Error(`Account export read failed for ${table}: ${error.message}`);
    }

    const page = data || [];
    rows.push(...page);

    if (page.length < EXPORT_PAGE_SIZE) return rows;
  }

  throw new Error(`Account export exceeded ${MAX_EXPORT_ROWS_PER_TABLE} rows for ${table}`);
}

export async function buildAccountExportPayload(
  admin: AdminClient,
  user: { id: string; email?: string | null; user_metadata?: Record<string, any> | null }
): Promise<AccountExportPayload> {
  const sections = await Promise.all(
    EXPORT_TABLES.map(async (table) => [table, await readAllRows(admin, table, user.id)] as const),
  );
  const byTable = Object.fromEntries(sections) as Record<string, any[]>;

  return {
    exported_at: new Date().toISOString(),
    user: {
      id: user.id,
      email: user.email || null,
      first_name: (user.user_metadata as any)?.first_name || null,
    },
    data: {
      reports: byTable.reports || [],
      passes: byTable.passes || [],
      user_usage: byTable.user_usage || [],
      user_profiles: byTable.user_profiles || [],
      saved_jobs: byTable.saved_jobs || [],
      billing_receipts: byTable.billing_receipts || [],
    },
    warnings: [],
  };
}
