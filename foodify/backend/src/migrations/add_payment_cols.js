require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const pool = require("../config/db");

async function columnExists(table, column) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS cnt FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column]
  );
  return rows[0].cnt > 0;
}

async function addColumnSafe(table, column, def) {
  if (await columnExists(table, column)) {
    console.log(`⚠️  Column '${column}' already exists - skipping.`);
  } else {
    await pool.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${def}`);
    console.log(`✅ Added column '${column}' to '${table}'.`);
  }
}

(async () => {
  try {
    console.log("Adding payment columns to orders table...");
    await addColumnSafe("orders", "payment_method", "VARCHAR(50) DEFAULT 'cod'");
    await addColumnSafe("orders", "payment_status", "VARCHAR(50) DEFAULT 'pending'");
    await addColumnSafe("orders", "stripe_payment_id", "VARCHAR(255) DEFAULT NULL");
    
    // Also drop dummy 'stripe_payment_id' if accidentally added without nullable
    console.log("Migration complete.");
  } catch (err) {
    console.error("Migration failed", err);
  } finally {
    process.exit(0);
  }
})();
