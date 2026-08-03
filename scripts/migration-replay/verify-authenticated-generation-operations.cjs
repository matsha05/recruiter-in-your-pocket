const assert = require("assert/strict");

async function asService(db, sql, params = []) {
  await db.exec("SET ROLE service_role");
  try {
    return await db.query(sql, params);
  } finally {
    await db.exec("RESET ROLE");
  }
}

async function begin(db, userId, operationId, digest) {
  const result = await asService(db, `
    SELECT public.begin_generation_operation(
      $1::uuid, $2::uuid, 'resume_feedback', $3::text
    ) AS result
  `, [userId, operationId, digest]);
  return result.rows[0].result;
}

async function status(db, userId, operationId) {
  const result = await asService(db, `
    SELECT public.get_generation_operation_status($1::uuid, $2::uuid) AS result
  `, [userId, operationId]);
  return result.rows[0].result;
}

async function verifyAuthenticatedGenerationOperations(db) {
  const owner = "94000000-0000-4000-8000-000000000001";
  const otherOwner = "94000000-0000-4000-8000-000000000002";
  const deniedOwner = "94000000-0000-4000-8000-000000000003";
  const ideasOwner = "94000000-0000-4000-8000-000000000004";
  for (const [index, userId] of [owner, otherOwner, deniedOwner, ideasOwner].entries()) {
    await db.query("INSERT INTO auth.users (id, email) VALUES ($1, $2)", [
      userId, `operation-${index}@test.invalid`,
    ]);
  }

  const operationId = "95000000-0000-4000-8000-000000000001";
  const digest = "1".repeat(64);
  const first = await begin(db, owner, operationId, digest);
  assert.equal(first.allowed, true);
  assert.equal(first.operation_state, "execute");
  assert.match(first.reservation_id, /^[0-9a-f-]{36}$/iu);
  assert.notEqual(first.reservation_id, operationId);

  const crossOwner = await begin(db, otherOwner, operationId, digest);
  assert.deepEqual(crossOwner, { allowed: false, operation_state: "conflict" });
  const digestConflict = await begin(db, owner, operationId, "2".repeat(64));
  assert.deepEqual(digestConflict, { allowed: false, operation_state: "conflict" });
  const pending = await begin(db, owner, operationId, digest);
  assert.equal(pending.allowed, false);
  assert.equal(pending.operation_state, "pending");
  assert.equal(pending.reservation_id, first.reservation_id);

  const ledgerCounts = await db.query(`
    SELECT
      (SELECT count(*)::integer FROM private.generation_operations WHERE operation_id = $1) AS operations,
      (SELECT count(*)::integer FROM private.generation_access_reservations WHERE id = $2) AS reservations
  `, [operationId, first.reservation_id]);
  assert.deepEqual(ledgerCounts.rows[0], { operations: 1, reservations: 1 });
  assert.deepEqual(await status(db, owner, operationId), {
    found: true, operation_state: "pending",
  });
  assert.deepEqual(await status(db, otherOwner, operationId), { found: false });

  await db.query(`
    INSERT INTO public.user_usage (user_id, free_report_used_at)
    VALUES ($1, clock_timestamp())
  `, [deniedOwner]);
  const deniedOperation = "95000000-0000-4000-8000-000000000002";
  const denied = await begin(db, deniedOwner, deniedOperation, digest);
  assert.equal(denied.allowed, false);
  assert.equal(denied.operation_state, "denied");
  const deniedLedger = await db.query(`
    SELECT status, reservation_id
    FROM private.generation_operations
    WHERE operation_id = $1
  `, [deniedOperation]);
  assert.deepEqual(deniedLedger.rows[0], { status: "denied", reservation_id: null });

  await db.query(`
    INSERT INTO public.passes (id, user_id, tier, uses_remaining, expires_at)
    VALUES ($1, $2, 'single_use', 1, clock_timestamp() + interval '1 day')
  `, ["96000000-0000-4000-8000-000000000003", deniedOwner]);
  const deniedAfterPurchase = await begin(db, deniedOwner, deniedOperation, digest);
  assert.deepEqual(deniedAfterPurchase, {
    allowed: false, operation_state: "denied", status: "denied",
  });
  assert.deepEqual(await status(db, deniedOwner, deniedOperation), {
    found: true, operation_state: "terminal",
  });
  const freshAfterPurchase = await begin(
    db, deniedOwner, "95000000-0000-4000-8000-000000000003", digest,
  );
  assert.equal(freshAfterPurchase.allowed, true);
  assert.equal(freshAfterPurchase.entitlement_kind, "pass_credit");

  await assert.rejects(
    () => asService(db, `
      SELECT public.reserve_generation_access($1::uuid, $2::uuid, 'resume_feedback')
    `, [ideasOwner, "97000000-0000-4000-8000-000000000001"]),
    /direct resume feedback reservation is forbidden/iu,
  );
  const ideas = await asService(db, `
    SELECT public.reserve_generation_access($1::uuid, $2::uuid, 'resume_ideas') AS result
  `, [ideasOwner, "97000000-0000-4000-8000-000000000002"]);
  assert.equal(ideas.rows[0].result.allowed, true);
  await assert.rejects(
    () => asService(db, `
      SELECT private.reserve_generation_access_internal(
        $1::uuid, $2::uuid, 'resume_feedback'
      )
    `, [ideasOwner, "97000000-0000-4000-8000-000000000003"]),
    /permission denied/iu,
  );

  const grants = await db.query(`
    SELECT
      has_function_privilege('anon', 'public.begin_generation_operation(uuid,uuid,text,text)', 'EXECUTE') AS anon_begin,
      has_function_privilege('authenticated', 'public.get_generation_operation_status(uuid,uuid)', 'EXECUTE') AS auth_status,
      has_function_privilege('service_role', 'public.begin_generation_operation(uuid,uuid,text,text)', 'EXECUTE') AS service_begin,
      has_function_privilege('service_role', 'public.get_generation_operation_status(uuid,uuid)', 'EXECUTE') AS service_status,
      has_function_privilege('service_role', 'public.reserve_generation_access(uuid,uuid,text)', 'EXECUTE') AS service_wrapper,
      has_function_privilege('service_role', 'private.reserve_generation_access_internal(uuid,uuid,text)', 'EXECUTE') AS service_internal
  `);
  assert.deepEqual(grants.rows[0], {
    anon_begin: false,
    auth_status: false,
    service_begin: true,
    service_status: true,
    service_wrapper: true,
    service_internal: false,
  });
}

module.exports = { verifyAuthenticatedGenerationOperations };
