const assert = require("assert/strict");

async function asService(db, sql, params = []) {
  await db.exec("SET ROLE service_role");
  try {
    return await db.query(sql, params);
  } finally {
    await db.exec("RESET ROLE");
  }
}

async function reserve(db, userId, reservationId) {
  const result = await asService(db, `
    SELECT public.reserve_generation_access($1::uuid, $2::uuid, 'resume_feedback') AS result
  `, [userId, reservationId]);
  assert.equal(result.rows[0].result.allowed, true);
  return result.rows[0].result;
}

function finalizationValues(userId, reservationId, overrides = {}) {
  const values = {
    digest: "a".repeat(64),
    resumeHash: "b".repeat(64),
    score: 74,
    scoreLabel: "Solid foundation",
    report: JSON.stringify({ score: 74, summary: "Grounded report" }),
    evidence: JSON.stringify({ items: [], signature: "replay" }),
    evidenceVersion: "v3:source-grounded-signed",
    evidenceSummary: "Grounded replay evidence",
    confidenceBand: "medium",
    preview: "Resume preview",
    jobDescription: "Short persisted job context",
    targetRole: "Program Manager",
    savedJobId: null,
    ...overrides,
  };
  return [
    userId, reservationId, values.digest, values.resumeHash, values.score,
    values.scoreLabel, values.report, values.evidence, values.evidenceVersion,
    values.evidenceSummary, values.confidenceBand, values.preview,
    values.jobDescription, values.targetRole, values.savedJobId,
  ];
}

async function finalize(db, values) {
  const result = await asService(db, `
    SELECT public.finalize_generation_report(
      $1::uuid, $2::uuid, $3::text, $4::text, $5::integer,
      $6::text, $7::jsonb, $8::jsonb, $9::text, $10::text,
      $11::text, $12::text, $13::text, $14::text, $15::uuid
    ) AS result
  `, values);
  return result.rows[0].result;
}

async function verifyAtomicReportFinalization(db) {
  const freeUser = "90000000-0000-4000-8000-000000000001";
  const directCommitUser = "90000000-0000-4000-8000-000000000002";
  const rollbackUser = "90000000-0000-4000-8000-000000000003";
  const passUser = "90000000-0000-4000-8000-000000000004";
  const savedJobUser = "90000000-0000-4000-8000-000000000005";
  const users = [freeUser, directCommitUser, rollbackUser, passUser, savedJobUser];
  for (const [index, userId] of users.entries()) {
    await db.query("INSERT INTO auth.users (id, email) VALUES ($1, $2)", [userId, `atomic-${index}@test.invalid`]);
  }

  const freeReservation = "91000000-0000-4000-8000-000000000001";
  await reserve(db, freeUser, freeReservation);
  const freeValues = finalizationValues(freeUser, freeReservation);
  const created = await finalize(db, freeValues);
  assert.equal(created.ok, true);
  assert.equal(created.status, "committed");
  assert.equal(created.action, "committed");
  assert.equal(created.report_final, true);
  assert.equal(created.idempotent, false);
  assert.match(created.report_id, /^[0-9a-f-]{36}$/i);

  const retry = await finalize(db, freeValues);
  assert.equal(retry.report_id, created.report_id);
  assert.equal(retry.idempotent, true);
  await assert.rejects(
    () => finalize(db, finalizationValues(freeUser, freeReservation, { digest: "c".repeat(64) })),
    /finalization payload mismatch/i,
  );
  const freeState = await db.query(`
    SELECT u.free_report_used_at, r.status, r.report_id,
      (SELECT count(*)::integer FROM public.reports WHERE user_id = $1) AS report_count
    FROM public.user_usage u
    JOIN private.generation_access_reservations r ON r.user_id = u.user_id
    WHERE u.user_id = $1 AND r.id = $2
  `, [freeUser, freeReservation]);
  assert.ok(freeState.rows[0].free_report_used_at);
  assert.equal(freeState.rows[0].status, "committed");
  assert.equal(freeState.rows[0].report_id, created.report_id);
  assert.equal(freeState.rows[0].report_count, 1);
  const releaseFinal = await asService(db, `
    SELECT public.release_generation_access($1::uuid, $2::uuid, 'delivery_error') AS result
  `, [freeUser, freeReservation]);
  assert.deepEqual(releaseFinal.rows[0].result, { ok: true, status: "committed", action: "none" });

  const directReservation = "91000000-0000-4000-8000-000000000002";
  await reserve(db, directCommitUser, directReservation);
  await assert.rejects(
    () => asService(db, `
      SELECT public.commit_generation_access($1::uuid, $2::uuid)
    `, [directCommitUser, directReservation]),
    /must use atomic finalization/i,
  );
  const directState = await db.query(`
    SELECT r.status, u.free_report_used_at
    FROM private.generation_access_reservations r
    JOIN public.user_usage u ON u.user_id = r.user_id
    WHERE r.id = $1
  `, [directReservation]);
  assert.equal(directState.rows[0].status, "reserved");
  assert.equal(directState.rows[0].free_report_used_at, null);

  const rollbackReservation = "91000000-0000-4000-8000-000000000003";
  await reserve(db, rollbackUser, rollbackReservation);
  await assert.rejects(
    () => finalize(db, finalizationValues(rollbackUser, rollbackReservation, { targetRole: "x".repeat(101) })),
    /value too long/i,
  );
  const rollbackState = await db.query(`
    SELECT r.status, u.free_report_used_at,
      (SELECT count(*)::integer FROM public.reports WHERE user_id = $1) AS report_count
    FROM private.generation_access_reservations r
    JOIN public.user_usage u ON u.user_id = r.user_id
    WHERE r.id = $2
  `, [rollbackUser, rollbackReservation]);
  assert.equal(rollbackState.rows[0].status, "reserved");
  assert.equal(rollbackState.rows[0].free_report_used_at, null);
  assert.equal(rollbackState.rows[0].report_count, 0);

  const passId = "92000000-0000-4000-8000-000000000004";
  await db.query(`
    INSERT INTO public.passes (id, user_id, tier, uses_remaining, purchased_at, expires_at)
    VALUES ($1, $2, 'single_use', 1, clock_timestamp(), clock_timestamp() + interval '1 day')
  `, [passId, passUser]);
  const passReservation = "91000000-0000-4000-8000-000000000004";
  const passAccess = await reserve(db, passUser, passReservation);
  assert.equal(passAccess.entitlement_kind, "pass_credit");
  const passResult = await finalize(db, finalizationValues(passUser, passReservation, { digest: "d".repeat(64) }));
  assert.equal(passResult.status, "committed");
  const pass = await db.query("SELECT uses_remaining FROM public.passes WHERE id = $1", [passId]);
  assert.equal(pass.rows[0].uses_remaining, 0);

  const wrongJobReservation = "91000000-0000-4000-8000-000000000005";
  await reserve(db, savedJobUser, wrongJobReservation);
  await assert.rejects(
    () => finalize(db, finalizationValues(savedJobUser, wrongJobReservation, {
      digest: "e".repeat(64),
      savedJobId: "93000000-0000-4000-8000-000000000005",
    })),
    /saved job ownership mismatch/i,
  );

  const grants = await db.query(`
    SELECT
      has_function_privilege('anon', 'public.finalize_generation_report(uuid,uuid,text,text,integer,text,jsonb,jsonb,text,text,text,text,text,text,uuid)', 'EXECUTE') AS anon_exec,
      has_function_privilege('authenticated', 'public.finalize_generation_report(uuid,uuid,text,text,integer,text,jsonb,jsonb,text,text,text,text,text,text,uuid)', 'EXECUTE') AS auth_exec,
      has_function_privilege('service_role', 'public.finalize_generation_report(uuid,uuid,text,text,integer,text,jsonb,jsonb,text,text,text,text,text,text,uuid)', 'EXECUTE') AS service_exec
  `);
  assert.deepEqual(grants.rows[0], { anon_exec: false, auth_exec: false, service_exec: true });
}

module.exports = { verifyAtomicReportFinalization };
