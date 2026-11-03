const assert = require("assert/strict");

async function asService(db, sql, params = []) {
  await db.exec("SET ROLE service_role");
  try {
    return await db.query(sql, params);
  } finally {
    await db.exec("RESET ROLE");
  }
}

// Migration 025: the pass lifecycle (granted -> used/expired -> revoked) is
// enforced by the passes table, the block table, and two RPC transitions.
async function verifyPassLifecycle(db) {
  let sequence = 0;
  const id = () => `b2000000-0000-4000-8000-${String(++sequence).padStart(12, "0")}`;
  const session = () => `cs_test_lifecycle_${++sequence}`;
  const user = async () => {
    const userId = id();
    await db.query("INSERT INTO auth.users (id, email) VALUES ($1, $2)", [userId, `${userId}@test.invalid`]);
    return userId;
  };
  const fulfill = async (userId, sessionId, overrides = {}) => {
    const input = {
      tier: "30d", uses: 5, priceId: "price_test", subscriptionId: null, paymentIntentId: null, customerId: "cus_test",
      ...overrides,
    };
    const result = await asService(db, `
      SELECT public.fulfill_checkout_pass(
        $1::uuid, $2::text, $3::text, $4::integer,
        clock_timestamp(), clock_timestamp() + interval '90 days',
        $5::text, $6::text, $7::text, $8::text
      ) AS result
    `, [userId, sessionId, input.tier, input.uses, input.priceId, input.subscriptionId, input.paymentIntentId, input.customerId]);
    return result.rows[0].result;
  };
  const revoke = async (sessionIds, paymentIntentId, subscriptionId, reason = "refund") => {
    const result = await asService(db, `
      SELECT public.revoke_checkout_entitlements($1::text[], $2::text, $3::text, $4::text) AS result
    `, [sessionIds, paymentIntentId, subscriptionId, reason]);
    return result.rows[0].result;
  };
  const readPass = async (passId) => {
    const result = await db.query(
      "SELECT uses_remaining, revoked_at, revocation_reason, (expires_at <= clock_timestamp()) AS ended FROM public.passes WHERE id = $1",
      [passId],
    );
    return result.rows[0];
  };

  // Grant: created once, then idempotent for the same checkout session.
  const buyer = await user();
  const firstSession = session();
  const created = await fulfill(buyer, firstSession, { paymentIntentId: "pi_first" });
  assert.equal(created.outcome, "created");
  assert.equal(created.pass.user_id, buyer);
  assert.equal(created.pass.uses_remaining, 5);
  const replay = await fulfill(buyer, firstSession, { paymentIntentId: "pi_first" });
  assert.equal(replay.outcome, "existing", "a replayed checkout event grants nothing new");
  assert.equal(replay.pass.id, created.pass.id);

  // Reversal: the one transition blocks the session and revokes the pass.
  const reversed = await revoke([firstSession], "pi_first", null, "refund");
  assert.deepEqual(reversed, { blocked: 1, revoked: 1 });
  let state = await readPass(created.pass.id);
  assert.equal(state.revocation_reason, "refund");
  assert.equal(state.uses_remaining, 0, "revocation zeroes credits in the same write");
  assert.equal(state.ended, true, "revocation ends expiry in the same write");

  // Terminal: nobody can un-revoke, and any later write keeps the row dead.
  await assert.rejects(
    () => db.query("UPDATE public.passes SET revoked_at = NULL, revocation_reason = NULL WHERE id = $1", [created.pass.id]),
    /pass_revocation_is_final/,
  );
  await db.query(
    "UPDATE public.passes SET uses_remaining = 9999, expires_at = clock_timestamp() + interval '30 days' WHERE id = $1",
    [created.pass.id],
  );
  state = await readPass(created.pass.id);
  assert.equal(state.uses_remaining, 0, "a late renewal write cannot restore credits to a revoked pass");
  assert.equal(state.ended, true, "a late renewal write cannot extend a revoked pass");
  assert.equal(state.revocation_reason, "refund");

  // Blocked: the same session cannot be granted again by any path.
  assert.equal((await fulfill(buyer, firstSession)).outcome, "blocked");
  await assert.rejects(
    () => db.query(`
      INSERT INTO public.passes (id, user_id, tier, uses_remaining, expires_at, checkout_session_id)
      VALUES ($1, $2, '30d', 5, clock_timestamp() + interval '90 days', $3)
    `, [id(), buyer, firstSession]),
    /pass_checkout_blocked: refund/,
    "a direct insert for a blocked session is refused at the table",
  );
  await assert.rejects(
    () => db.query(`
      INSERT INTO public.passes (id, user_id, tier, uses_remaining, expires_at, checkout_session_id, stripe_payment_intent_id)
      VALUES ($1, $2, '30d', 5, clock_timestamp() + interval '90 days', $3, 'pi_first')
    `, [id(), buyer, session()]),
    /pass_checkout_blocked/,
    "a refunded payment intent cannot grant a pass under a new session id",
  );

  // Block-then-grant race, modelled in order: once the block row exists, the
  // grant sees it inside the same lock and writes nothing.
  const racedSession = session();
  await db.query(
    "INSERT INTO public.billing_entitlement_blocks (checkout_session_id, stripe_payment_intent_id, reason) VALUES ($1, 'pi_raced', 'dispute')",
    [racedSession],
  );
  const raced = await fulfill(buyer, racedSession, { paymentIntentId: "pi_raced" });
  assert.deepEqual(raced, { outcome: "blocked", reason: "dispute" });

  // Grant-then-block: inserting a block revokes the pass already granted, so
  // the app no longer has to update passes itself after writing the block.
  const lateSession = session();
  const late = await fulfill(buyer, lateSession, { paymentIntentId: "pi_late" });
  assert.equal(late.outcome, "created");
  await db.query(
    "INSERT INTO public.billing_entitlement_blocks (checkout_session_id, stripe_payment_intent_id, reason) VALUES ($1, 'pi_late', 'refund')",
    [lateSession],
  );
  state = await readPass(late.pass.id);
  assert.equal(state.revocation_reason, "refund", "a block revokes the pass it names");
  assert.equal(state.uses_remaining, 0);

  // Account deletion writes blocks for the user's sessions, which now also
  // revokes before the rows are deleted.
  const deletedSession = session();
  const deleted = await fulfill(buyer, deletedSession);
  await db.query(
    "INSERT INTO public.billing_entitlement_blocks (checkout_session_id, reason) VALUES ($1, 'account_deleted')",
    [deletedSession],
  );
  assert.equal((await readPass(deleted.pass.id)).revocation_reason, "account_deleted");

  // Subscription renewal through a new checkout extends the unrevoked pass;
  // a revoked subscription pass is never revived.
  const subscriber = await user();
  const subscriptionGrant = await fulfill(subscriber, session(), {
    tier: "monthly", uses: 9999, subscriptionId: "sub_renew",
  });
  assert.equal(subscriptionGrant.outcome, "created");
  const renewal = await fulfill(subscriber, session(), {
    tier: "monthly", uses: 9999, subscriptionId: "sub_renew",
  });
  assert.equal(renewal.outcome, "renewed");
  assert.equal(renewal.pass.id, subscriptionGrant.pass.id, "the same subscription keeps one pass row");
  const subscriptionReversal = await revoke([], null, "sub_renew", "refund");
  assert.equal(subscriptionReversal.revoked, 1, "a subscription refund reaches the pass without a payment intent");
  assert.ok(subscriptionReversal.blocked >= 1, "the subscription pass's session is blocked too");
  const revived = await fulfill(subscriber, session(), {
    tier: "monthly", uses: 9999, subscriptionId: "sub_renew",
  });
  assert.equal(revived.outcome, "blocked", "a replayed checkout cannot revive a refunded subscription pass");
  assert.equal(revived.reason, "refund");
  assert.equal((await readPass(subscriptionGrant.pass.id)).revocation_reason, "refund");

  // A legacy subscription row with no checkout session is still reversible.
  const legacyOwner = await user();
  const legacyPass = id();
  await db.query(`
    INSERT INTO public.passes (id, user_id, tier, uses_remaining, expires_at, stripe_subscription_id)
    VALUES ($1, $2, 'monthly', 9999, clock_timestamp() + interval '20 days', 'sub_legacy')
  `, [legacyPass, legacyOwner]);
  assert.deepEqual(await revoke([], null, "sub_legacy", "dispute"), { blocked: 0, revoked: 1 });
  assert.equal((await readPass(legacyPass)).revocation_reason, "dispute");

  // A reversal that reaches nothing reports zero so the caller can decide.
  assert.deepEqual(await revoke([], "pi_unknown", null, "refund"), { blocked: 0, revoked: 0 });
  await assert.rejects(() => revoke([session()], null, null, "because"), /reversal reason is invalid/);

  // A direct insert that arrives already revoked is coerced into the dead
  // shape, so the revoked-shape constraint holds without the writer's help.
  const shapeOwner = await user();
  const shapePass = id();
  await db.query(`
    INSERT INTO public.passes (id, user_id, tier, uses_remaining, expires_at, revoked_at, revocation_reason)
    VALUES ($1, $2, '30d', 5, clock_timestamp() + interval '1 day', clock_timestamp(), 'refund')
  `, [shapePass, shapeOwner]);
  state = await readPass(shapePass);
  assert.equal(state.uses_remaining, 0);
  assert.equal(state.ended, true);
  const shape = await db.query(`
    SELECT count(*)::integer AS violations
    FROM public.passes
    WHERE revoked_at IS NOT NULL AND (uses_remaining <> 0 OR expires_at > revoked_at)
  `);
  assert.equal(shape.rows[0].violations, 0, "no revoked pass can carry credits or a live expiry");

  // Browser roles cannot call either transition.
  for (const role of ["anon", "authenticated"]) {
    await db.exec(`SET ROLE ${role}`);
    try {
      await assert.rejects(
        () => db.query("SELECT public.fulfill_checkout_pass($1::uuid, 'cs_browser', '30d', 5, NULL, clock_timestamp(), NULL, NULL, NULL, NULL)", [buyer]),
        /permission denied/i,
      );
      await assert.rejects(
        () => db.query("SELECT public.revoke_checkout_entitlements(ARRAY['cs_browser'], NULL, NULL, 'refund')"),
        /permission denied/i,
      );
    } finally {
      await db.exec("RESET ROLE");
    }
  }
}

module.exports = { verifyPassLifecycle };
