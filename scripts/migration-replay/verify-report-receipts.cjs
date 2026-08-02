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
        $1::text, $2::uuid, $3::uuid, $4::text, $5::integer, $6::text,
        $7::jsonb, $8::jsonb, $9::text, $10::text, $11::text, $12::timestamptz
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
  await db.query("INSERT INTO auth.users (id, email) VALUES ($1, 'owner@test.invalid'), ($2, 'attacker@test.invalid')", [owner, attacker]);

  const values = [
    receiptHash, owner, firstReport, "b".repeat(64), 72, "Solid foundation",
    JSON.stringify({ score: 72 }), JSON.stringify({ items: [], signature: "test" }),
    "grounded-v1", "Resume preview", "Program Manager", "2026-08-02T12:00:00Z",
  ];
  assert.deepEqual(await claim(db, values), { status: "created", report_id: firstReport });
  assert.deepEqual(
    await claim(db, values.map((value, index) => index === 2 ? retryReport : value)),
    { status: "idempotent", report_id: firstReport },
  );
  assert.deepEqual(
    await claim(db, values.map((value, index) => index === 1 ? attacker : value)),
    { status: "consumed" },
  );

  const grants = await db.query(`
    SELECT
      has_function_privilege('anon', 'public.claim_anonymous_report_receipt(text,uuid,uuid,text,integer,text,jsonb,jsonb,text,text,text,timestamptz)', 'EXECUTE') AS anon_exec,
      has_function_privilege('authenticated', 'public.claim_anonymous_report_receipt(text,uuid,uuid,text,integer,text,jsonb,jsonb,text,text,text,timestamptz)', 'EXECUTE') AS auth_exec,
      has_function_privilege('service_role', 'public.claim_anonymous_report_receipt(text,uuid,uuid,text,integer,text,jsonb,jsonb,text,text,text,timestamptz)', 'EXECUTE') AS service_exec,
      has_table_privilege('authenticated', 'public.reports', 'SELECT') AS auth_select,
      has_table_privilege('authenticated', 'public.reports', 'DELETE') AS auth_delete,
      has_table_privilege('authenticated', 'public.reports', 'INSERT') AS auth_insert,
      has_column_privilege('authenticated', 'public.reports', 'name', 'UPDATE') AS auth_rename,
      has_column_privilege('authenticated', 'public.reports', 'report_json', 'UPDATE') AS auth_report_update,
      has_table_privilege('service_role', 'public.reports', 'SELECT,INSERT,DELETE') AS service_report_ops,
      has_table_privilege('service_role', 'private.anonymous_report_receipt_claims', 'SELECT,INSERT') AS service_claim_ops,
      has_table_privilege('service_role', 'private.anonymous_report_receipt_claims', 'UPDATE,DELETE') AS service_claim_mutation,
      has_table_privilege('authenticated', 'private.anonymous_report_receipt_claims', 'SELECT,INSERT,UPDATE,DELETE') AS auth_claim_access
  `);
  assert.deepEqual(grants.rows[0], {
    anon_exec: false, auth_exec: false, service_exec: true,
    auth_select: true, auth_delete: true, auth_insert: false,
    auth_rename: true, auth_report_update: false, service_report_ops: true,
    service_claim_ops: true, service_claim_mutation: false, auth_claim_access: false,
  });

  await expectDenied(db, "anon", "SELECT public.claim_anonymous_report_receipt($1::text, $2::uuid, $3::uuid, $4::text, $5::integer, $6::text, $7::jsonb, $8::jsonb, $9::text, $10::text, $11::text, $12::timestamptz)", values);
  await expectDenied(db, "authenticated", "SELECT public.claim_anonymous_report_receipt($1::text, $2::uuid, $3::uuid, $4::text, $5::integer, $6::text, $7::jsonb, $8::jsonb, $9::text, $10::text, $11::text, $12::timestamptz)", values);
  await expectDenied(db, "anon", "INSERT INTO private.anonymous_report_receipt_claims (receipt_hash, user_id, report_id) VALUES ($1, $2, $3)", ["c".repeat(64), owner, retryReport]);
  await expectDenied(db, "authenticated", "INSERT INTO private.anonymous_report_receipt_claims (receipt_hash, user_id, report_id) VALUES ($1, $2, $3)", ["c".repeat(64), owner, retryReport]);
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
    await claim(db, values.map((value, index) => index === 1 ? attacker : value)),
    { status: "consumed" },
  );
  const serviceReport = "55555555-5555-4555-8555-555555555555";
  const serviceValues = values.map((value, index) => {
    if (index === 0) return "d".repeat(64);
    if (index === 2) return serviceReport;
    return value;
  });
  assert.deepEqual(await claim(db, serviceValues), { status: "created", report_id: serviceReport });
  await db.exec("SET ROLE service_role");
  try {
    const deleted = await db.query("DELETE FROM public.reports WHERE id = $1 RETURNING id", [serviceReport]);
    assert.equal(deleted.rows[0].id, serviceReport);
  } finally {
    await resetRole(db);
  }
  assert.deepEqual(await claim(db, serviceValues), { status: "consumed" });
  const claimCount = await db.query("SELECT count(*)::integer AS count FROM private.anonymous_report_receipt_claims");
  assert.equal(claimCount.rows[0].count, 2, "report deletion must not remove durable receipt claims");
}

module.exports = { verifyReportReceiptSecurity };
