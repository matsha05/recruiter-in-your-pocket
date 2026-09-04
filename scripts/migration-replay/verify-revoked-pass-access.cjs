const assert = require("assert/strict");

async function asService(db, sql, params = []) {
  await db.exec("SET ROLE service_role");
  try {
    return await db.query(sql, params);
  } finally {
    await db.exec("RESET ROLE");
  }
}

async function verifyRevokedPassAccess(db) {
  let sequence = 0;
  const id = () => `a1000000-0000-4000-8000-${String(++sequence).padStart(12, "0")}`;
  const user = async (freeUsed = true) => {
    const userId = id();
    await db.query("INSERT INTO auth.users (id, email) VALUES ($1, $2)", [userId, `${userId}@test.invalid`]);
    await db.query(`
      INSERT INTO public.user_usage (user_id, free_report_used_at)
      VALUES ($1, CASE WHEN $2::boolean THEN clock_timestamp() ELSE NULL END)
    `, [userId, freeUsed]);
    return userId;
  };
  const pass = async (userId, tier, credits, revoked = false) => {
    const passId = id();
    await db.query(`
      INSERT INTO public.passes (id, user_id, tier, uses_remaining, expires_at, revoked_at)
      VALUES ($1, $2, $3, $4, clock_timestamp() + interval '30 days',
        CASE WHEN $5::boolean THEN clock_timestamp() ELSE NULL END)
    `, [passId, userId, tier, credits, revoked]);
    return passId;
  };
  const begin = async (userId) => {
    const result = await asService(db, `
      SELECT public.begin_generation_operation($1::uuid, $2::uuid, 'resume_feedback', $3::text) AS result
    `, [userId, id(), "d".repeat(64)]);
    return result.rows[0].result;
  };
  const finalize = async (userId, reservationId) => {
    const result = await asService(db, `
      SELECT public.finalize_generation_report(
        $1::uuid, $2::uuid, $3::text, $4::text, 74,
        'Clear and specific', '{"score":74,"summary":"Revocation check"}'::jsonb,
        '{"items":[],"signature":"replay"}'::jsonb, 'v3:source-grounded-signed',
        'Replay evidence', 'medium', 'Resume preview', NULL, NULL, NULL
      ) AS result
    `, [userId, reservationId, "a".repeat(64), "b".repeat(64)]);
    return result.rows[0].result;
  };
  const revokeWithoutChangingCreditsOrExpiry = async (passId) => {
    // Model the corrupt shape left by a late pre-fix subscription update:
    // positive credits/future expiry alongside an authoritative revocation.
    await db.query("UPDATE public.passes SET revoked_at = clock_timestamp(), revocation_reason = 'refund' WHERE id = $1", [passId]);
  };

  for (const tier of ["monthly", "lifetime", "single_use", "30d", "90d"]) {
    const owner = await user();
    await pass(owner, tier, 9_999, true);
    const denied = await begin(owner);
    assert.equal(denied.allowed, false, `revoked ${tier} cannot reserve despite future expiry and credits`);
    assert.equal(denied.operation_state, "denied");
    const holds = await db.query("SELECT count(*)::integer AS count FROM private.generation_access_reservations WHERE user_id = $1", [owner]);
    assert.equal(holds.rows[0].count, 0);
  }
  for (const exhausted of [false, true]) {
    const owner = await user();
    const passId = await pass(owner, exhausted ? "30d" : "monthly", exhausted ? 0 : 9_999);
    if (!exhausted) await db.query("UPDATE public.passes SET expires_at = clock_timestamp() - interval '1 second' WHERE id = $1", [passId]);
    assert.equal((await begin(owner)).allowed, false, "expiry and generation-credit exhaustion remain enforced");
  }

  const alternativeOwner = await user();
  await pass(alternativeOwner, "monthly", 9_999, true);
  const validAlternative = await pass(alternativeOwner, "30d", 1);
  const alternative = await begin(alternativeOwner);
  assert.equal(alternative.allowed, true);
  assert.equal(alternative.pass.id, validAlternative, "revoked unlimited pass does not conceal a valid finite purchase");
  const freeOwner = await user(false);
  await pass(freeOwner, "monthly", 9_999, true);
  assert.equal((await begin(freeOwner)).entitlement_kind, "free", "independent free eligibility remains available");

  for (const tier of ["monthly", "lifetime"]) {
    const owner = await user();
    const passId = await pass(owner, tier, 0);
    const reservation = await begin(owner);
    assert.equal(reservation.allowed, true, "unrevoked unlimited access ignores credit count");
    assert.equal(reservation.entitlement_kind, "pass_unlimited");
    const committed = await finalize(owner, reservation.reservation_id);
    assert.equal(committed.ok, true);
    await revokeWithoutChangingCreditsOrExpiry(passId);
    const retry = await finalize(owner, reservation.reservation_id);
    assert.equal(retry.report_id, committed.report_id);
    assert.equal(retry.idempotent, true, "revocation does not undo an already committed report");
    assert.equal((await begin(owner)).allowed, false);
  }

  for (const tier of ["monthly", "lifetime", "30d"]) {
    const owner = await user();
    const passId = await pass(owner, tier, 1);
    const reservation = await begin(owner);
    assert.equal(reservation.allowed, true);
    await revokeWithoutChangingCreditsOrExpiry(passId);
    await assert.rejects(() => finalize(owner, reservation.reservation_id), /generation pass was revoked or is unavailable/i);
    const state = await db.query(`
      SELECT r.status, p.uses_remaining,
        (SELECT count(*)::integer FROM public.reports WHERE user_id = $1) AS reports
      FROM private.generation_access_reservations r
      JOIN public.passes p ON p.id = r.pass_id
      WHERE r.id = $2
    `, [owner, reservation.reservation_id]);
    assert.deepEqual(state.rows[0], { status: "reserved", uses_remaining: 1, reports: 0 },
      "revocation during generation rolls back both report insertion and credit mutation");
  }

  for (const tier of ["monthly", "30d"]) {
    const owner = await user();
    const passId = await pass(owner, tier, 1);
    const reservationId = id();
    const reserveIdeas = () => asService(db, `
      SELECT public.reserve_generation_access($1::uuid, $2::uuid, 'resume_ideas') AS result
    `, [owner, reservationId]);
    assert.equal((await reserveIdeas()).rows[0].result.allowed, true);
    await revokeWithoutChangingCreditsOrExpiry(passId);
    await assert.rejects(() => asService(db, `
      SELECT public.commit_generation_access($1::uuid, $2::uuid)
    `, [owner, reservationId]), /generation pass was revoked or is unavailable/i);
    const state = await db.query(`
      SELECT r.status, p.uses_remaining FROM private.generation_access_reservations r
      JOIN public.passes p ON p.id = r.pass_id WHERE r.id = $1
    `, [reservationId]);
    assert.deepEqual(state.rows[0], { status: "reserved", uses_remaining: 1 });
    const retriedIdeas = (await reserveIdeas()).rows[0].result;
    assert.equal(retriedIdeas.allowed, false, "reusing a revoked ideas hold cannot authorize another provider run");
    assert.equal(retriedIdeas.status, "released");
  }

  // Preserve the existing 15-minute hold policy: mere passage of the purchase
  // expiry after reservation is different from explicitly revoking the pass.
  const heldOwner = await user();
  const heldPass = await pass(heldOwner, "monthly", 0);
  const acceptedHold = await begin(heldOwner);
  await db.query("UPDATE public.passes SET expires_at = clock_timestamp() - interval '1 second' WHERE id = $1", [heldPass]);
  assert.equal((await finalize(heldOwner, acceptedHold.reservation_id)).ok, true);
  console.log("Revoked pass reservation, commit, and finalization checks passed.");
}

module.exports = { verifyRevokedPassAccess };
