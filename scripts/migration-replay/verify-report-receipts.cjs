const assert = require("assert/strict");

async function resetRole(db) {
  await db.exec("RESET ROLE");
}

async function expectDenied(db, role, sql, params = []) {
  await db.exec(`SET ROLE ${role}`);
  try {
    await assert.rejects(() => db.query(sql, params), /permission denied|does not exist/i);
  } finally {
    await resetRole(db);
  }
}

async function claim(db, values) {
  await db.exec("SET ROLE service_role");
  try {
    const result = await db.query(`
      SELECT public.claim_anonymous_report_receipt(
        $1::text, $2::timestamptz, $3::uuid, $4::uuid, $5::text, $6::integer,
        $7::text, $8::jsonb, $9::jsonb, $10::text, $11::text, $12::text, $13::timestamptz
      ) AS claim
    `, values);
    return result.rows[0].claim;
  } finally {
    await resetRole(db);
  }
}

async function verifyReportReceiptSecurity(db) {
  const owner = "11111111-1111-4111-8111-111111111111";
  const attacker = "22222222-2222-4222-8222-222222222222";
  const firstReport = "33333333-3333-4333-8333-333333333333";
  const retryReport = "44444444-4444-4444-8444-444444444444";
  const receiptHash = "a".repeat(64);
  const expiresAt = new Date(Date.now() + 60_000).toISOString();
  await db.query("INSERT INTO auth.users (id, email) VALUES ($1, 'owner@test.invalid'), ($2, 'attacker@test.invalid')", [owner, attacker]);

  const values = [
    receiptHash, expiresAt, owner, firstReport, "b".repeat(64), 72, "Solid foundation",
    JSON.stringify({ score: 72 }), JSON.stringify({ items: [], signature: "test" }),
    "grounded-v1", "Resume preview", "Program Manager", "2026-08-02T12:00:00Z",
  ];
  assert.deepEqual(await claim(db, values), { status: "created", report_id: firstReport });
  assert.deepEqual(
    await claim(db, values.map((value, index) => index === 3 ? retryReport : value)),
    { status: "idempotent", report_id: firstReport },
  );
  assert.deepEqual(
    await claim(db, values.map((value, index) => index === 2 ? attacker : value)),
    { status: "consumed" },
  );

  const grants = await db.query(`
    SELECT
      has_function_privilege('anon', 'public.claim_anonymous_report_receipt(text,timestamptz,uuid,uuid,text,integer,text,jsonb,jsonb,text,text,text,timestamptz)', 'EXECUTE') AS anon_exec,
      has_function_privilege('authenticated', 'public.claim_anonymous_report_receipt(text,timestamptz,uuid,uuid,text,integer,text,jsonb,jsonb,text,text,text,timestamptz)', 'EXECUTE') AS auth_exec,
      has_function_privilege('service_role', 'public.claim_anonymous_report_receipt(text,timestamptz,uuid,uuid,text,integer,text,jsonb,jsonb,text,text,text,timestamptz)', 'EXECUTE') AS service_exec,
      has_table_privilege('authenticated', 'public.reports', 'SELECT') AS auth_select,
      has_table_privilege('authenticated', 'public.reports', 'DELETE') AS auth_delete,
      has_table_privilege('authenticated', 'public.reports', 'INSERT') AS auth_insert,
      has_column_privilege('authenticated', 'public.reports', 'name', 'UPDATE') AS auth_rename,
      has_column_privilege('authenticated', 'public.reports', 'report_json', 'UPDATE') AS auth_report_update,
      has_table_privilege('service_role', 'public.reports', 'SELECT,INSERT,DELETE') AS service_report_ops,
      has_table_privilege('service_role', 'private.anonymous_report_receipt_claims', 'SELECT,INSERT') AS service_claim_ops,
      has_table_privilege('service_role', 'private.anonymous_report_receipt_claims', 'UPDATE,DELETE') AS service_claim_mutation,
      has_table_privilege('authenticated', 'private.anonymous_report_receipt_claims', 'SELECT,INSERT,UPDATE,DELETE') AS auth_claim_access,
      has_function_privilege('anon', 'private.purge_expired_anonymous_report_receipt_claims()', 'EXECUTE') AS anon_purge,
      has_function_privilege('authenticated', 'private.purge_expired_anonymous_report_receipt_claims()', 'EXECUTE') AS auth_purge,
      has_function_privilege('service_role', 'private.purge_expired_anonymous_report_receipt_claims()', 'EXECUTE') AS service_purge
  `);
  assert.deepEqual(grants.rows[0], {
    anon_exec: false, auth_exec: false, service_exec: true,
    auth_select: true, auth_delete: true, auth_insert: false,
    auth_rename: true, auth_report_update: false, service_report_ops: true,
    service_claim_ops: true, service_claim_mutation: false, auth_claim_access: false,
    anon_purge: false, auth_purge: false, service_purge: true,
  });

  const callSql = "SELECT public.claim_anonymous_report_receipt($1::text, $2::timestamptz, $3::uuid, $4::uuid, $5::text, $6::integer, $7::text, $8::jsonb, $9::jsonb, $10::text, $11::text, $12::text, $13::timestamptz)";
  await expectDenied(db, "anon", callSql, values);
  await expectDenied(db, "authenticated", callSql, values);
  const directClaim = "INSERT INTO private.anonymous_report_receipt_claims (receipt_hash, report_id, expires_at) VALUES ($1, $2, $3)";
  await expectDenied(db, "anon", directClaim, ["c".repeat(64), retryReport, expiresAt]);
  await expectDenied(db, "authenticated", directClaim, ["c".repeat(64), retryReport, expiresAt]);
  await expectDenied(db, "authenticated", "UPDATE public.reports SET report_json = '{}'::jsonb WHERE id = $1", [firstReport]);

  await db.query("SELECT set_config('request.jwt.claim.sub', $1, false)", [owner]);
  await db.exec("SET ROLE authenticated");
  try {
    const renamed = await db.query("UPDATE public.reports SET name = 'Keep' WHERE id = $1 RETURNING name", [firstReport]);
    assert.equal(renamed.rows[0].name, "Keep");
    const deleted = await db.query("DELETE FROM public.reports WHERE id = $1 RETURNING id", [firstReport]);
    assert.equal(deleted.rows[0].id, firstReport);
  } finally {
    await resetRole(db);
  }

  assert.deepEqual(await claim(db, values), { status: "consumed" });
  assert.deepEqual(
    await claim(db, values.map((value, index) => index === 2 ? attacker : value)),
    { status: "consumed" },
  );
  const serviceReport = "55555555-5555-4555-8555-555555555555";
  const serviceValues = values.map((value, index) => {
    if (index === 0) return "d".repeat(64);
    if (index === 3) return serviceReport;
    return value;
  });
  assert.deepEqual(await claim(db, serviceValues), { status: "created", report_id: serviceReport });
  await db.query("DELETE FROM auth.users WHERE id = $1", [owner]);
  assert.deepEqual(await claim(db, serviceValues), { status: "consumed" });

  const serviceDeletedReport = "77777777-7777-4777-8777-777777777777";
  const serviceDeletedValues = values.map((value, index) => {
    if (index === 0) return "f".repeat(64);
    if (index === 2) return attacker;
    if (index === 3) return serviceDeletedReport;
    return value;
  });
  assert.deepEqual(await claim(db, serviceDeletedValues), { status: "created", report_id: serviceDeletedReport });
  await db.exec("SET ROLE service_role");
  try {
    const deleted = await db.query("DELETE FROM public.reports WHERE id = $1 RETURNING id", [serviceDeletedReport]);
    assert.equal(deleted.rows[0].id, serviceDeletedReport);
  } finally {
    await resetRole(db);
  }
  assert.deepEqual(await claim(db, serviceDeletedValues), { status: "consumed" });

  const tooLongValues = values.map((value, index) => {
    if (index === 0) return "9".repeat(64);
    if (index === 1) return new Date(Date.now() + (24 * 60 * 60 * 1000) + 60_000).toISOString();
    if (index === 2) return attacker;
    if (index === 3) return "88888888-8888-4888-8888-888888888888";
    return value;
  });
  await assert.rejects(() => claim(db, tooLongValues), /invalid anonymous report receipt claim/i);
  const columns = await db.query("SELECT column_name FROM information_schema.columns WHERE table_schema = 'private' AND table_name = 'anonymous_report_receipt_claims'");
  assert.equal(columns.rows.some((row) => row.column_name === "user_id"), false);

  const expiringReport = "66666666-6666-4666-8666-666666666666";
  const expiringValues = values.map((value, index) => {
    if (index === 0) return "e".repeat(64);
    if (index === 1) return new Date(Date.now() + 1_000).toISOString();
    if (index === 2) return attacker;
    if (index === 3) return expiringReport;
    return value;
  });
  assert.deepEqual(await claim(db, expiringValues), { status: "created", report_id: expiringReport });
  await new Promise((resolve) => setTimeout(resolve, 1_100));
  await db.exec("SET ROLE service_role");
  try {
    const purged = await db.query("SELECT private.purge_expired_anonymous_report_receipt_claims() AS count");
    assert.equal(purged.rows[0].count, 1);
  } finally {
    await resetRole(db);
  }
  await assert.rejects(() => claim(db, expiringValues), /invalid anonymous report receipt claim/i);
  const claimCount = await db.query("SELECT count(*)::integer AS count FROM private.anonymous_report_receipt_claims");
  assert.equal(claimCount.rows[0].count, 3, "unexpired deletion tombstones must remain during their bounded replay window");
  const cronJob = await db.query("SELECT count(*)::integer AS count FROM cron.job WHERE jobname = 'riyp-purge-expired-anonymous-report-receipts'");
  assert.equal(cronJob.rows[0].count, 1, "expired receipt claims must have an automatic purge job");
}

module.exports = { verifyReportReceiptSecurity };
