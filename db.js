const crypto = require("crypto");
const { Pool } = require("pg");

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is required. Provision Postgres and set this env var.");
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  // Vercel/Neon use SSL; allow opt-out for local dev with DATABASE_SSL=false
  ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: false }
});

pool.on("error", (err) => {
  console.error("Postgres pool error", err);
});

function now() {
  return new Date().toISOString();
}

function uuid() {
  return crypto.randomUUID();
}

function hashCode(code) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

function toIso(value) {
  if (!value) return value;
  return value instanceof Date ? value.toISOString() : value;
}

async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS login_codes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      code_hash TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      used BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_login_codes_user ON login_codes(user_id);
    CREATE INDEX IF NOT EXISTS idx_login_codes_expires ON login_codes(expires_at);

    CREATE TABLE IF NOT EXISTS passes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      tier TEXT NOT NULL,
      purchased_at TIMESTAMPTZ NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      price_id TEXT,
      checkout_session_id TEXT,
      created_at TIMESTAMPTZ NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_passes_user ON passes(user_id);
    CREATE INDEX IF NOT EXISTS idx_passes_expires ON passes(expires_at);

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
  `);
}

const initPromise = ensureSchema();

async function healthCheck() {
  await initPromise;
  await pool.query("SELECT 1");
  return true;
}

function mapUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    created_at: toIso(row.created_at)
  };
}

async function upsertUserByEmail(email) {
  await initPromise;
  const { rows } = await pool.query(
    `
      INSERT INTO users (id, email, created_at)
      VALUES ($1, $2, $3)
      ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
      RETURNING id, email, created_at
    `,
    [uuid(), email, now()]
  );
  return mapUser(rows[0]);
}

async function getUserByEmail(email) {
  await initPromise;
  const { rows } = await pool.query(
    `SELECT id, email, created_at FROM users WHERE email = $1`,
    [email]
  );
  return mapUser(rows[0]);
}

async function getUserById(id) {
  await initPromise;
  const { rows } = await pool.query(
    `SELECT id, email, created_at FROM users WHERE id = $1`,
    [id]
  );
  return mapUser(rows[0]);
}

async function createLoginCode(userId, code, expiresAt) {
  await initPromise;
  const record = {
    id: uuid(),
    user_id: userId,
    code_hash: hashCode(code),
    expires_at: new Date(expiresAt).toISOString(),
    used: false,
    created_at: now()
  };
  await pool.query(`DELETE FROM login_codes WHERE user_id = $1 AND used = FALSE`, [userId]);
  await pool.query(
    `
      INSERT INTO login_codes (id, user_id, code_hash, expires_at, used, created_at)
      VALUES ($1, $2, $3, $4, $5, $6)
    `,
    [
      record.id,
      record.user_id,
      record.code_hash,
      record.expires_at,
      record.used,
      record.created_at
    ]
  );
  return record;
}

async function validateAndUseLoginCode(userId, code) {
  await initPromise;
  const codeHash = hashCode(code);
  const { rows } = await pool.query(
    `
      SELECT id, used, expires_at
      FROM login_codes
      WHERE user_id = $1 AND code_hash = $2
      ORDER BY created_at DESC
      LIMIT 1
    `,
    [userId, codeHash]
  );
  const row = rows[0];
  if (!row) return { ok: false, reason: "not_found" };
  if (row.used) return { ok: false, reason: "used" };
  if (new Date(row.expires_at) < new Date()) return { ok: false, reason: "expired" };

  const update = await pool.query(
    `UPDATE login_codes SET used = TRUE WHERE id = $1 AND used = FALSE RETURNING id`,
    [row.id]
  );
  if (update.rowCount === 0) return { ok: false, reason: "used" };
  return { ok: true };
}

async function createSession(userId, token, expiresAt) {
  await initPromise;
  const session = {
    id: uuid(),
    user_id: userId,
    token,
    expires_at: new Date(expiresAt).toISOString(),
    created_at: now()
  };
  await pool.query(
    `
      INSERT INTO sessions (id, user_id, token, expires_at, created_at)
      VALUES ($1, $2, $3, $4, $5)
    `,
    [session.id, session.user_id, session.token, session.expires_at, session.created_at]
  );
  return session;
}

async function getSessionByToken(token) {
  await initPromise;
  const { rows } = await pool.query(
    `SELECT id, user_id, token, expires_at, created_at FROM sessions WHERE token = $1`,
    [token]
  );
  const row = rows[0];
  if (!row) return null;
  if (new Date(row.expires_at) < new Date()) {
    await deleteSessionByToken(token);
    return null;
  }
  return {
    id: row.id,
    user_id: row.user_id,
    token: row.token,
    expires_at: toIso(row.expires_at),
    created_at: toIso(row.created_at)
  };
}

async function deleteSessionByToken(token) {
  await initPromise;
  await pool.query(`DELETE FROM sessions WHERE token = $1`, [token]);
}

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
  await initPromise;
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
  await pool.query(
    `
      INSERT INTO passes (id, user_id, tier, purchased_at, expires_at, price_id, checkout_session_id, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `,
    [
      pass.id,
      pass.user_id,
      pass.tier,
      pass.purchased_at,
      pass.expires_at,
      pass.price_id,
      pass.checkout_session_id,
      pass.created_at
    ]
  );
  return pass;
}

async function getActivePasses(userId) {
  await initPromise;
  const { rows } = await pool.query(
    `
      SELECT id, tier, purchased_at, expires_at, price_id
      FROM passes
      WHERE user_id = $1 AND expires_at > NOW()
      ORDER BY expires_at DESC
    `,
    [userId]
  );
  return rows.map(mapPass);
}

async function getLatestPass(userId) {
  await initPromise;
  const { rows } = await pool.query(
    `
      SELECT id, tier, purchased_at, expires_at, price_id
      FROM passes
      WHERE user_id = $1 AND expires_at > NOW()
      ORDER BY expires_at DESC
      LIMIT 1
    `,
    [userId]
  );
  return mapPass(rows[0]);
}

async function runMigrations() {
  await ensureSchema();
}

module.exports = {
  pool,
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
  now,
  uuid
};

