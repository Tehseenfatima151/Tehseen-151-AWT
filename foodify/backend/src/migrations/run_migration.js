/**
 * Migration runner: adds category + brand columns to restaurants table
 * Run once with: node backend/src/migrations/run_migration.js
 */
require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const pool = require("../config/db");
const fs   = require("fs");
const path = require("path");

(async () => {
  const sql = fs.readFileSync(path.join(__dirname, "add_category_brand.sql"), "utf8");

  // Split on semicolons and run each statement
  const statements = sql
    .split(";")
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith("--"));

  try {
    for (const stmt of statements) {
      console.log("Running:", stmt.slice(0, 80), "...");
      await pool.query(stmt);
    }
    console.log("\n✅  Migration complete — category & brand columns added and seeded.");
  } catch (err) {
    console.error("❌  Migration failed:", err.message);
  } finally {
    process.exit(0);
  }
})();
