type AdminClient = {
  from: (table: string) => {
    select: (query: string) => {
      eq: (column: string, value: string) => {
        order: (
          column: string,
          opts: { ascending: boolean }
        ) => Promise<{ data: any[] | null; error: { message: string } | null }>;
      };
    };
  };
};

export type AccountExportSection = {
  table: string;
  rows: any[];
  error?: string;
};

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
    saved_jobs: any[];
    billing_receipts: any[];
  };
  warnings: Array<{ table: string; error: string }>;
};

const EXPORT_TABLES = ["reports", "passes", "user_usage", "saved_jobs", "billing_receipts"] as const;

async function safeRead(admin: AdminClient, table: string, userId: string): Promise<AccountExportSection> {
  try {
    const { data, error } = await admin
      .from(table)
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return { table, rows: [], error: error.message };
    }

    return { table, rows: data || [] };
  } catch (err: any) {
    return { table, rows: [], error: err?.message || "Read failed" };
  }
}

export async function buildAccountExportPayload(
  admin: AdminClient,
  user: { id: string; email?: string | null; user_metadata?: Record<string, any> | null }
): Promise<AccountExportPayload> {
  const sections = await Promise.all(EXPORT_TABLES.map((table) => safeRead(admin, table, user.id)));

  const byTable = Object.fromEntries(sections.map((section) => [section.table, section.rows])) as Record<string, any[]>;

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
      saved_jobs: byTable.saved_jobs || [],
      billing_receipts: byTable.billing_receipts || [],
    },
    warnings: sections
      .filter((section) => typeof section.error === "string")
      .map((section) => ({ table: section.table, error: section.error as string })),
  };
}
