#!/usr/bin/env node

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const assert = require("assert/strict");
const dotenv = require("dotenv");
const { Client } = require("pg");

const repoRoot = path.resolve(__dirname, "..");
const migrationsDir = path.join(repoRoot, "web", "database", "migrations");

// Explicit order is intentional. Two historical migrations share the 003
// prefix and three predate the numbering convention, so filesystem sorting is
// not a safe deployment contract.
const MIGRATIONS = [
  ["000_base_schema", "web/database/schema.sql"],
  ["002_stripe_events", "web/database/migrations/002_stripe_events.sql"],
  ["003_enable_rls", "web/database/migrations/003_enable_rls.sql"],
  ["003_user_resume_profiles", "web/database/migrations/003_user_resume_profiles.sql"],
  ["004_add_resume_text", "web/database/migrations/004_add_resume_text.sql"],
  ["005_add_resume_filename", "web/database/migrations/005_add_resume_filename.sql"],
  ["005a_add_report_versioning", "web/database/migrations/add_report_versioning.sql"],
  ["005b_add_uses_remaining", "web/database/migrations/add_uses_remaining.sql"],
  ["005c_add_variant_support", "web/database/migrations/add_variant_support.sql"],
  ["006_core_product_tables", "web/database/migrations/006_core_product_tables.sql"],
  ["007_billing_receipts", "web/database/migrations/007_billing_receipts.sql"],
  ["008_report_evidence", "web/database/migrations/008_report_evidence.sql"],
  ["009_account_export_jobs", "web/database/migrations/009_account_export_jobs.sql"],
  ["010_link_reports_to_saved_jobs", "web/database/migrations/010_link_reports_to_saved_jobs.sql"],
  ["011_harden_billing_and_webhooks", "web/database/migrations/011_harden_billing_and_webhooks.sql"],
  ["012_generation_access_reservations", "web/database/migrations/012_generation_access_reservations.sql"],
  ["013_database_advisor_hardening", "web/database/migrations/013_database_advisor_hardening.sql"],
  ["014_atomic_stripe_event_leases", "web/database/migrations/014_atomic_stripe_event_leases.sql"],
  ["015_account_export_database_cron", "web/database/migrations/015_account_export_database_cron.sql"],
  ["016_billing_reversals_and_deletion_safety", "web/database/migrations/016_billing_reversals_and_deletion_safety.sql"],
];

function loadLocalEnvironment() {
  for (const relativePath of [".env", ".env.local", "web/.env", "web/.env.local"]) {
    const envPath = path.join(repoRoot, relativePath);
    if (fs.existsSync(envPath)) dotenv.config({ path: envPath, override: false, quiet: true });
  }
}

function resolveMigrationTarget() {
  const connectionString = process.env.SUPABASE_DB_URL;
  if (!connectionString) {
    throw new Error(
      "SUPABASE_DB_URL is required to run hosted migrations. " +
      "DATABASE_URL is intentionally ignored so a legacy database cannot be migrated by accident."
    );
  }

  const expectedProjectRef = process.env.SUPABASE_PROJECT_ID || process.env.RIYP_EXPECTED_SUPABASE_PROJECT_REF;
  if (!expectedProjectRef) {
    throw new Error(
      "SUPABASE_PROJECT_ID (or RIYP_EXPECTED_SUPABASE_PROJECT_REF) is required to verify the migration target."
    );
  }

  let target;
  try {
    target = new URL(connectionString);
  } catch {
    throw new Error("SUPABASE_DB_URL must be a valid PostgreSQL connection URL.");
  }

  const hostname = target.hostname.toLowerCase();
  const username = decodeURIComponent(target.username || "").toLowerCase();
  const normalizedRef = expectedProjectRef.trim().toLowerCase();
  const isDirectProjectHost = hostname === `db.${normalizedRef}.supabase.co`;
  const isSupabasePooler = hostname.endsWith(".pooler.supabase.com") && username.endsWith(`.${normalizedRef}`);

  if (!isDirectProjectHost && !isSupabasePooler) {
    throw new Error(
      `Refusing migration: SUPABASE_DB_URL does not resolve to expected project ${normalizedRef}.`
    );
  }

  return connectionString;
}

function checksum(sql) {
  return crypto.createHash("sha256").update(sql).digest("hex");
}

function buildManifest() {
  const ids = new Set();
  const relativePaths = new Set();
  const manifest = MIGRATIONS.map(([id, relativePath]) => {
    if (ids.has(id)) throw new Error(`Duplicate migration id: ${id}`);
    if (relativePaths.has(relativePath)) throw new Error(`Duplicate migration path: ${relativePath}`);
    ids.add(id);
    relativePaths.add(relativePath);

    const absolutePath = path.join(repoRoot, relativePath);
    if (!fs.existsSync(absolutePath)) throw new Error(`Missing migration file: ${relativePath}`);
    const sql = fs.readFileSync(absolutePath, "utf8");
    if (!sql.trim()) throw new Error(`Empty migration file: ${relativePath}`);
    return { id, relativePath, sql, checksum: checksum(sql) };
  });

  const discovered = fs.readdirSync(migrationsDir)
    .filter((name) => name.endsWith(".sql"))
    .map((name) => `web/database/migrations/${name}`)
    .sort();
  const unlisted = discovered.filter((relativePath) => !relativePaths.has(relativePath));
  if (unlisted.length > 0) {
    throw new Error(`Unlisted migration files: ${unlisted.join(", ")}`);
  }

  return manifest;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const baselineArg = args.find((arg) => arg.startsWith("--baseline-through="));
  return {
    checkOnly: args.includes("--check"),
    replayOnly: args.includes("--replay-check"),
    baselineThrough: baselineArg ? baselineArg.slice("--baseline-through=".length) : null,
  };
}

async function verifyCleanReplay(manifest) {
  const { PGlite } = require("@electric-sql/pglite");
  const { vector } = require("@electric-sql/pglite/vector");
  const { uuid_ossp } = require("@electric-sql/pglite/contrib/uuid_ossp");
  const { pgcrypto } = require("@electric-sql/pglite/contrib/pgcrypto");
  const db = new PGlite({ extensions: { vector, uuid_ossp, pgcrypto } });

  try {
    // Supabase owns these roles and the auth schema. The stubs let the exact
    // repository SQL replay against disposable Postgres without contacting a
    // linked Supabase project.
    await db.exec(`
      CREATE ROLE anon NOLOGIN;
      CREATE ROLE authenticated NOLOGIN;
      CREATE ROLE service_role NOLOGIN;
      CREATE SCHEMA auth;
      CREATE TABLE auth.users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT
      );
      CREATE FUNCTION auth.uid()
      RETURNS UUID
      LANGUAGE SQL
      STABLE
      AS 'SELECT NULL::UUID';

      -- PGlite does not bundle Supabase's pg_cron extension. This provider
      -- stub preserves parse and execution coverage for migration 015 while
      -- the hosted-environment gate separately verifies the real extension.
      CREATE SCHEMA cron;
      CREATE FUNCTION cron.schedule(job_name TEXT, schedule TEXT, command TEXT)
      RETURNS BIGINT
      LANGUAGE SQL
      AS 'SELECT 1::BIGINT';
    `);

    for (const migration of manifest) {
      const replaySql = migration.id === "015_account_export_database_cron"
        ? migration.sql.replace(
          /CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;\s*/i,
          "",
        )
        : migration.sql;
      await db.exec("BEGIN");
      try {
        await db.exec(replaySql);
        await db.exec("COMMIT");
      } catch (error) {
        await db.exec("ROLLBACK");
        throw new Error(`Clean replay failed at ${migration.id}: ${error.message}`, { cause: error });
      }
    }

    const token1 = "11111111-1111-4111-8111-111111111111";
    const token2 = "22222222-2222-4222-8222-222222222222";
    const first = await db.query(`
      SELECT public.claim_stripe_event(
        'evt_replay', 'checkout.session.completed', '{}'::jsonb,
        'req_1', $1::uuid, 300
      ) AS claim
    `, [token1]);
    assert.equal(first.rows[0].claim.claimed, true);

    const duplicate = await db.query(`
      SELECT public.claim_stripe_event(
        'evt_replay', 'checkout.session.completed', '{}'::jsonb,
        'req_2', $1::uuid, 300
      ) AS claim
    `, [token2]);
    assert.deepEqual(duplicate.rows[0].claim, { claimed: false, reason: "leased" });

    const wrongOwner = await db.query(
      "SELECT public.complete_stripe_event('evt_replay', $1::uuid) AS completed",
      [token2]
    );
    assert.equal(wrongOwner.rows[0].completed, false);

    const owner = await db.query(
      "SELECT public.complete_stripe_event('evt_replay', $1::uuid) AS completed",
      [token1]
    );
    assert.equal(owner.rows[0].completed, true);

    const terminal = await db.query(`
      SELECT public.claim_stripe_event(
        'evt_replay', 'checkout.session.completed', '{}'::jsonb,
        'req_3', $1::uuid, 300
      ) AS claim
    `, [token2]);
    assert.deepEqual(terminal.rows[0].claim, { claimed: false, reason: "completed" });

    const grants = await db.query(`
      SELECT
        has_function_privilege(
          'anon',
          'public.claim_stripe_event(text,text,jsonb,text,uuid,integer)',
          'EXECUTE'
        ) AS anon_can_claim,
        has_function_privilege(
          'authenticated',
          'public.claim_stripe_event(text,text,jsonb,text,uuid,integer)',
          'EXECUTE'
        ) AS authenticated_can_claim,
        has_function_privilege(
          'service_role',
          'public.claim_stripe_event(text,text,jsonb,text,uuid,integer)',
          'EXECUTE'
        ) AS service_can_claim
    `);
    assert.equal(grants.rows[0].anon_can_claim, false);
    assert.equal(grants.rows[0].authenticated_can_claim, false);
    assert.equal(grants.rows[0].service_can_claim, true);

    const rls = await db.query(`
      SELECT relrowsecurity
      FROM pg_class
      WHERE oid = 'public.stripe_events'::regclass
    `);
    assert.equal(rls.rows[0].relrowsecurity, true);

    console.log(`Clean migration replay passed: ${manifest.length} ordered files.`);
    console.log("Atomic Stripe lease ownership, terminal completion, grants, and RLS passed.");
  } finally {
    await db.close();
  }
}

async function createMigrationLedger(client) {
  await client.query("CREATE SCHEMA IF NOT EXISTS private");
  await client.query(`
    CREATE TABLE IF NOT EXISTS private.riyp_schema_migrations (
      id TEXT PRIMARY KEY,
      file_path TEXT NOT NULL,
      checksum_sha256 TEXT NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function baselineExistingDatabase(client, manifest, baselineThrough) {
  const existing = await client.query("SELECT count(*)::integer AS count FROM private.riyp_schema_migrations");
  if (existing.rows[0].count !== 0) {
    throw new Error("Cannot baseline a database that already has tracked migrations.");
  }

  const schemaState = await client.query("SELECT to_regclass('public.cases') IS NOT NULL AS exists");
  if (!schemaState.rows[0].exists) {
    throw new Error("Cannot baseline a fresh database. Run migrations normally.");
  }

  const baselineIndex = manifest.findIndex((migration) => migration.id === baselineThrough);
  if (baselineIndex < 0) throw new Error(`Unknown baseline migration id: ${baselineThrough}`);

  await client.query("BEGIN");
  try {
    for (const migration of manifest.slice(0, baselineIndex + 1)) {
      await client.query(
        `INSERT INTO private.riyp_schema_migrations (id, file_path, checksum_sha256)
         VALUES ($1, $2, $3)`,
        [migration.id, migration.relativePath, migration.checksum]
      );
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }

  console.log(`Baselined existing database through ${baselineThrough}.`);
}

async function applyMigrations(client, manifest) {
  const appliedResult = await client.query(
    "SELECT id, checksum_sha256 FROM private.riyp_schema_migrations ORDER BY applied_at, id"
  );
  const applied = new Map(appliedResult.rows.map((row) => [row.id, row.checksum_sha256]));

  if (applied.size === 0) {
    const schemaState = await client.query("SELECT to_regclass('public.cases') IS NOT NULL AS exists");
    if (schemaState.rows[0].exists) {
      throw new Error(
        "Existing schema has no migration ledger. Verify its state, then rerun with " +
        "--baseline-through=<verified migration id>; the runner will not guess."
      );
    }
  }

  let appliedCount = 0;
  for (const migration of manifest) {
    const previousChecksum = applied.get(migration.id);
    if (previousChecksum) {
      if (previousChecksum !== migration.checksum) {
        throw new Error(`Applied migration changed on disk: ${migration.id}`);
      }
      continue;
    }

    await client.query("BEGIN");
    try {
      await client.query("SET LOCAL statement_timeout = '60s'");
      await client.query(migration.sql);
      await client.query(
        `INSERT INTO private.riyp_schema_migrations (id, file_path, checksum_sha256)
         VALUES ($1, $2, $3)`,
        [migration.id, migration.relativePath, migration.checksum]
      );
      await client.query("COMMIT");
      appliedCount += 1;
      console.log(`Applied ${migration.id}`);
    } catch (error) {
      await client.query("ROLLBACK");
      throw new Error(`Migration ${migration.id} failed: ${error.message}`, { cause: error });
    }
  }

  console.log(appliedCount === 0 ? "Database is already current." : `Applied ${appliedCount} migration(s).`);
}

async function main() {
  const args = parseArgs();
  const manifest = buildManifest();
  if (args.checkOnly) {
    console.log(`Migration manifest is valid: ${manifest.length} ordered files.`);
    return;
  }
  if (args.replayOnly) {
    await verifyCleanReplay(manifest);
    return;
  }

  loadLocalEnvironment();
  const connectionString = resolveMigrationTarget();

  const client = new Client({ connectionString, connectionTimeoutMillis: 10_000 });
  let locked = false;
  try {
    await client.connect();
    await client.query("SELECT pg_advisory_lock(hashtext('riyp_schema_migrations'))");
    locked = true;
    await createMigrationLedger(client);
    if (args.baselineThrough) {
      await baselineExistingDatabase(client, manifest, args.baselineThrough);
    }
    await applyMigrations(client, manifest);
  } finally {
    if (locked) await client.query("SELECT pg_advisory_unlock(hashtext('riyp_schema_migrations'))");
    await client.end().catch(() => undefined);
  }
}

main().catch((error) => {
  console.error(error.message || String(error));
  process.exitCode = 1;
});
