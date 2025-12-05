require("dotenv").config();

const { runMigrations, pool } = require("../db");

async function main() {
  try {
    await runMigrations();
    console.log("Database migrations completed.");
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error("Database migrations failed:", err.message);
    try {
      await pool.end();
    } catch (_) {
      // ignore pool close errors
    }
    process.exit(1);
  }
}

main();

