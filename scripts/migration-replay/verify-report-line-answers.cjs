const assert = require("assert/strict");

// Exercise migration 026's actual SQL, including privileges and owner binding, in the
// disposable replay database. No linked Supabase environment is touched.
async function verifyReportLineAnswers(db) {
  const owner = "b3000000-0000-4000-8000-000000000001";
  const stranger = "b3000000-0000-4000-8000-000000000002";
  const reportId = "b3000000-0000-4000-8000-000000000003";
  await db.query("INSERT INTO auth.users (id, email) VALUES ($1, 'answers@test.invalid'), ($2, 'stranger@test.invalid')", [owner, stranger]);
  await db.query("INSERT INTO public.reports (id, user_id) VALUES ($1, $2)", [reportId, owner]);

  const signature = "public.update_report_line_answers(uuid,uuid,integer,jsonb,text,text)";
  const privileges = await db.query(`
    SELECT has_function_privilege('anon', $1, 'EXECUTE') AS anon,
      has_function_privilege('authenticated', $1, 'EXECUTE') AS authenticated,
      has_function_privilege('service_role', $1, 'EXECUTE') AS service
  `, [signature]);
  assert.deepEqual(privileges.rows[0], { anon: false, authenticated: false, service: true });

  const write = async (index, answers, line, source = "literal", userId = owner) => {
    const result = await db.query(`
      SELECT public.update_report_line_answers($1::uuid, $2::uuid, $3::integer, $4::jsonb, $5::text, $6::text) AS answers
    `, [reportId, userId, index, JSON.stringify(answers), line, source]);
    return result.rows[0].answers;
  };
  const answer = text => [{ question: "Which tool?", kind: "answered", text }];

  await db.exec("SET ROLE service_role");
  try {
    await write(0, answer("inventory app"), "Built the inventory app.");
    const both = await write(1, answer("billing app"), "Built the billing app.");
    assert.deepEqual(Object.keys(both).sort(), ["0", "1"], "a second card changes the current row without replacing the first");
    assert.equal(both["0"].line, "Built the inventory app.");
    assert.ok(Number.isFinite(Date.parse(both["1"].updated_at)), "the stored card has a server timestamp");

    assert.equal(await write(0, answer("not mine"), "Not mine.", "literal", stranger), null, "the RPC independently binds the report to its owner");
    const cleared = await write(0, [], null);
    assert.deepEqual(Object.keys(cleared), ["1"], "clear removes only its card");
    assert.deepEqual(await write(0, [], null), cleared, "clear is idempotent");
    const afterClear = await write(2, answer("support app"), "Built the support app.");
    assert.deepEqual(Object.keys(afterClear).sort(), ["1", "2"], "a later independent save does not revive the cleared card");

    // The endpoint checks these too, but a future service-role caller must not bypass the bounds.
    for (const args of [
      [12, answer("tool"), "Line."],
      [0, [], "Old line."],
      [0, [], null, "polished"],
      [0, [{ question: "Q", kind: "answered", text: "" }], null],
      [0, [{ question: "Q", kind: "open" }], null],
      [0, [{ question: "Q", kind: "answered", text: "x".repeat(301) }], null],
      [0, Array.from({ length: 7 }, () => ({ question: "Q", kind: "unknown" })), null],
      [0, answer("tool"), "x".repeat(601)],
      [0, {}, null],
    ]) {
      await assert.rejects(() => write(...args), /invalid_line_answers/);
    }
    await write(1, [], null);
    assert.deepEqual(await write(2, [], null), {}, "clearing the final card succeeds with an empty object, not a missing-row result");
  } finally {
    await db.exec("RESET ROLE");
  }
  await db.query("DELETE FROM public.reports WHERE id = $1", [reportId]);
  assert.equal(await write(0, answer("tool"), "Line."), null, "a deleted report cannot be recreated by a delayed answer save");
}

module.exports = { verifyReportLineAnswers };
