const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
}

// Service role client bypasses RLS - use only on backend
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

function now() {
  return new Date().toISOString();
}

function uuid() {
  return crypto.randomUUID();
}

function toIso(value) {
  if (!value) return value;
  return value instanceof Date ? value.toISOString() : value;
}

async function healthCheck() {
  const { error } = await supabase.from("profiles").select("id").limit(1);
  if (error) throw error;
  return true;
}

// --- Profile/User functions ---

function mapUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    first_name: row.first_name || null,
    created_at: toIso(row.created_at)
  };
}

async function upsertUserByEmail(email) {
  // First check if user exists
  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", email.toLowerCase())
    .single();

  if (existing) {
    return mapUser(existing);
  }

  // For new users, we need to create them via Supabase Auth first
  // The trigger will auto-create the profile
  // But for webhook/backend use, we may need to create profile directly
  const newId = uuid();
  const { data, error } = await supabase
    .from("profiles")
    .insert({ id: newId, email: email.toLowerCase(), created_at: now() })
    .select()
    .single();

  if (error) {
    // If conflict, fetch existing
    if (error.code === "23505") {
      const { data: fetched } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", email.toLowerCase())
        .single();
      return mapUser(fetched);
    }
    throw error;
  }

  return mapUser(data);
}

async function getUserByEmail(email) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", email.toLowerCase())
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return mapUser(data);
}

async function getUserById(id) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return mapUser(data);
}

async function updateUserFirstName(userId, firstName) {
  const { data, error } = await supabase
    .from("profiles")
    .update({ first_name: firstName })
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return mapUser(data);
}

// --- Pass functions ---

function mapPass(row) {
  if (!row) return null;
  return {
    id: row.id,
    tier: row.tier,
    purchased_at: toIso(row.purchased_at),
    expires_at: toIso(row.expires_at),
    price_id: row.price_id
  };
}

async function createPass(userId, tier, expiresAt, priceId, checkoutSessionId) {
  const pass = {
    id: uuid(),
    user_id: userId,
    tier,
    purchased_at: now(),
    expires_at: new Date(expiresAt).toISOString(),
    price_id: priceId || null,
    checkout_session_id: checkoutSessionId || null,
    created_at: now()
  };

  const { data, error } = await supabase
    .from("passes")
    .insert(pass)
    .select()
    .single();

  if (error) throw error;
  return mapPass(data);
}

async function getActivePasses(userId) {
  const { data, error } = await supabase
    .from("passes")
    .select("*")
    .eq("user_id", userId)
    .gt("expires_at", new Date().toISOString())
    .order("expires_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(mapPass);
}

async function getLatestPass(userId) {
  const { data, error } = await supabase
    .from("passes")
    .select("*")
    .eq("user_id", userId)
    .gt("expires_at", new Date().toISOString())
    .order("expires_at", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return mapPass(data);
}

async function getAllPasses(userId) {
  const { data, error } = await supabase
    .from("passes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(row => ({
    id: row.id,
    tier: row.tier,
    expires_at: toIso(row.expires_at),
    created_at: toIso(row.created_at) || toIso(row.purchased_at),
    stripe_session_id: row.checkout_session_id
  }));
}

// --- Report functions ---

function hashResumeText(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function mapReport(row) {
  if (!row) return null;
  return {
    id: row.id,
    user_id: row.user_id,
    resume_hash: row.resume_hash,
    score: row.score,
    score_label: row.score_label,
    report_json: row.report_json,
    resume_preview: row.resume_preview,
    created_at: toIso(row.created_at)
  };
}

async function saveReport(userId, resumeText, score, scoreLabel, reportJson) {
  const resumeHash = hashResumeText(resumeText);
  let preview = resumeText.slice(0, 200).trim();
  const lastSpace = preview.lastIndexOf(" ");
  if (lastSpace > 150) preview = preview.slice(0, lastSpace) + "...";
  else if (resumeText.length > 200) preview += "...";

  const report = {
    id: uuid(),
    user_id: userId,
    resume_hash: resumeHash,
    score,
    score_label: scoreLabel || null,
    report_json: reportJson,
    resume_preview: preview,
    created_at: now()
  };

  const { data, error } = await supabase
    .from("reports")
    .insert(report)
    .select()
    .single();

  if (error) throw error;
  return mapReport(data);
}

async function getReportsForUser(userId, limit = 20) {
  const { data, error } = await supabase
    .from("reports")
    .select("id, score, score_label, resume_preview, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []).map(row => ({
    id: row.id,
    score: row.score,
    score_label: row.score_label,
    resume_preview: row.resume_preview,
    created_at: toIso(row.created_at)
  }));
}

async function getReportById(reportId, userId) {
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("id", reportId)
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return mapReport(data);
}

// --- Legacy functions (no longer needed with Supabase Auth) ---
// Keeping stubs for compatibility during migration

async function createLoginCode() {
  console.warn("createLoginCode is deprecated - use Supabase Auth");
  return null;
}

async function validateAndUseLoginCode() {
  console.warn("validateAndUseLoginCode is deprecated - use Supabase Auth");
  return { ok: false, reason: "deprecated" };
}

async function createSession() {
  console.warn("createSession is deprecated - use Supabase Auth");
  return null;
}

async function getSessionByToken() {
  console.warn("getSessionByToken is deprecated - use Supabase Auth");
  return null;
}

async function deleteSessionByToken() {
  console.warn("deleteSessionByToken is deprecated - use Supabase Auth");
}

async function runMigrations() {
  // No longer needed - Supabase handles schema
  console.log("runMigrations: Using Supabase - no local migrations needed");
}

module.exports = {
  supabase,
  healthCheck,
  runMigrations,
  upsertUserByEmail,
  getUserByEmail,
  getUserById,
  createLoginCode,
  validateAndUseLoginCode,
  createSession,
  getSessionByToken,
  deleteSessionByToken,
  createPass,
  getActivePasses,
  getLatestPass,
  getAllPasses,
  saveReport,
  getReportsForUser,
  getReportById,
  updateUserFirstName,
  now,
  uuid
};
