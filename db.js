const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");
const crypto = require("crypto");

const DB_PATH = process.env.DATABASE_URL || path.join(__dirname, "data", "app.db");
const DB_DIR = path.dirname(DB_PATH);

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

function now() {
  return new Date().toISOString();
}

function ensureSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS login_codes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      code_hash TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_login_codes_user ON login_codes(user_id);
    CREATE INDEX IF NOT EXISTS idx_login_codes_expires ON login_codes(expires_at);

    CREATE TABLE IF NOT EXISTS passes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      tier TEXT NOT NULL,
      purchased_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      price_id TEXT,
      checkout_session_id TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_passes_user ON passes(user_id);
    CREATE INDEX IF NOT EXISTS idx_passes_expires ON passes(expires_at);

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
  `);
}

ensureSchema();

function uuid() {
  return crypto.randomUUID();
}

function hashCode(code) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

function upsertUserByEmail(email) {
  const existing = db.prepare("SELECT id, email, created_at FROM users WHERE email = ?").get(email);
  if (existing) return existing;
  const user = { id: uuid(), email, created_at: now() };
  db.prepare("INSERT INTO users (id, email, created_at) VALUES (@id, @email, @created_at)").run(user);
  return user;
}

function getUserByEmail(email) {
  return db.prepare("SELECT id, email, created_at FROM users WHERE email = ?").get(email);
}

function getUserById(id) {
  return db.prepare("SELECT id, email, created_at FROM users WHERE id = ?").get(id);
}

function createLoginCode(userId, code, expiresAt) {
  const record = {
    id: uuid(),
    user_id: userId,
    code_hash: hashCode(code),
    expires_at: expiresAt,
    used: 0,
    created_at: now()
  };
  // Invalidate previous unused codes for this user
  db.prepare("DELETE FROM login_codes WHERE user_id = ? AND used = 0").run(userId);
  db.prepare(`
    INSERT INTO login_codes (id, user_id, code_hash, expires_at, used, created_at)
    VALUES (@id, @user_id, @code_hash, @expires_at, @used, @created_at)
  `).run(record);
  return record;
}

function validateAndUseLoginCode(userId, code) {
  const codeHash = hashCode(code);
  const row = db.prepare(`
    SELECT id, user_id, code_hash, expires_at, used
    FROM login_codes
    WHERE user_id = ? AND code_hash = ?
  `).get(userId, codeHash);
  if (!row) return { ok: false, reason: "not_found" };
  if (row.used) return { ok: false, reason: "used" };
  if (new Date(row.expires_at) < new Date()) return { ok: false, reason: "expired" };
  db.prepare("UPDATE login_codes SET used = 1 WHERE id = ?").run(row.id);
  return { ok: true };
}

function createSession(userId, token, expiresAt) {
  const session = {
    id: uuid(),
    user_id: userId,
    token,
    expires_at: expiresAt,
    created_at: now()
  };
  db.prepare(`
    INSERT INTO sessions (id, user_id, token, expires_at, created_at)
    VALUES (@id, @user_id, @token, @expires_at, @created_at)
  `).run(session);
  return session;
}

function getSessionByToken(token) {
  const row = db.prepare(`
    SELECT id, user_id, token, expires_at, created_at
    FROM sessions
    WHERE token = ?
  `).get(token);
  if (!row) return null;
  if (new Date(row.expires_at) < new Date()) {
    db.prepare("DELETE FROM sessions WHERE id = ?").run(row.id);
    return null;
  }
  return row;
}

function deleteSessionByToken(token) {
  db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
}

function createPass(userId, tier, expiresAt, priceId, checkoutSessionId) {
  const pass = {
    id: uuid(),
    user_id: userId,
    tier,
    purchased_at: now(),
    expires_at: expiresAt,
    price_id: priceId || null,
    checkout_session_id: checkoutSessionId || null,
    created_at: now()
  };
  db.prepare(`
    INSERT INTO passes (id, user_id, tier, purchased_at, expires_at, price_id, checkout_session_id, created_at)
    VALUES (@id, @user_id, @tier, @purchased_at, @expires_at, @price_id, @checkout_session_id, @created_at)
  `).run(pass);
  return pass;
}

function getActivePasses(userId) {
  return db.prepare(`
    SELECT id, tier, purchased_at, expires_at, price_id
    FROM passes
    WHERE user_id = ? AND datetime(expires_at) > datetime('now')
    ORDER BY datetime(expires_at) DESC
  `).all(userId);
}

function getLatestPass(userId) {
  const row = db.prepare(`
    SELECT id, tier, purchased_at, expires_at, price_id
    FROM passes
    WHERE user_id = ? AND datetime(expires_at) > datetime('now')
    ORDER BY datetime(expires_at) DESC
    LIMIT 1
  `).get(userId);
  return row || null;
}

module.exports = {
  db,
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

