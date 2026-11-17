const assert = require("assert/strict");

// Migration 027: one card's answers are set inside a single UPDATE, so two saves for two cards keep each other.
async function verifyLineAnswerMerge(db) {
  const owner = "77777777-7777-4777-8777-777777777777";
  const stranger = "88888888-8888-4888-8888-888888888888";
  const report = "99999999-9999-4999-8999-999999999999";
  await db.query("INSERT INTO auth.users (id, email) VALUES ($1, 'answers-owner@test.invalid'), ($2, 'answers-stranger@test.invalid')", [owner, stranger]);
  await db.query("INSERT INTO public.reports (id, user_id) VALUES ($1, $2)", [report, owner]);
  const entry = (text) => JSON.stringify({ answers: [{ question: "What changed?", kind: "answered", text }], line: null, source: "literal", updated_at: "2026-11-17T00:00:00Z" });
  const set = async (userId, index, text) => {
    await db.exec("SET ROLE service_role");
    try {
      const result = await db.query("SELECT public.set_report_line_answer($1::uuid, $2::uuid, $3::text, $4::jsonb) AS stored", [report, userId, index, entry(text)]);
      return result.rows[0].stored;
    } finally {
      await db.exec("RESET ROLE");
    }
  };

  await db.query("UPDATE public.reports SET line_answers = NULL WHERE id = $1", [report]);
  await set(owner, "0", "first card");
  const both = await set(owner, "2", "third card");
  assert.deepEqual(Object.keys(both).sort(), ["0", "2"], "a second card keeps the first card's answers");
  const replaced = await set(owner, "0", "first card, edited");
  assert.equal(replaced["0"].answers[0].text, "first card, edited", "the same card is replaced");
  assert.equal(replaced["2"].answers[0].text, "third card");
  assert.equal(await set(stranger, "1", "not theirs"), null, "another account's report is never written");
  const stored = await db.query("SELECT line_answers FROM public.reports WHERE id = $1", [report]);
  assert.deepEqual(Object.keys(stored.rows[0].line_answers).sort(), ["0", "2"]);

  await db.query("UPDATE public.reports SET line_answers = '[]'::jsonb WHERE id = $1", [report]);
  assert.deepEqual(Object.keys(await set(owner, "1", "after a stray array")), ["1"], "a non-object starts from empty");

  const grants = await db.query(`
    SELECT
      has_function_privilege('anon', 'public.set_report_line_answer(uuid,uuid,text,jsonb)', 'EXECUTE') AS anon_exec,
      has_function_privilege('authenticated', 'public.set_report_line_answer(uuid,uuid,text,jsonb)', 'EXECUTE') AS auth_exec,
      has_function_privilege('service_role', 'public.set_report_line_answer(uuid,uuid,text,jsonb)', 'EXECUTE') AS service_exec
  `);
  assert.equal(grants.rows[0].anon_exec, false);
  assert.equal(grants.rows[0].auth_exec, false);
  assert.equal(grants.rows[0].service_exec, true);
  await db.query("DELETE FROM public.reports WHERE id = $1", [report]);
  await db.query("DELETE FROM auth.users WHERE id IN ($1, $2)", [owner, stranger]);
}

module.exports = { verifyLineAnswerMerge };
