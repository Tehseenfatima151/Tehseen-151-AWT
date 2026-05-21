require("dotenv").config();
const pool = require("../src/config/db");

async function check() {
  try {
    const [[{ version }]] = await pool.query("SELECT VERSION() as version");
    console.log("DB connected. MySQL version:", version);

    const [restCols] = await pool.query("SHOW COLUMNS FROM restaurants");
    console.log("\nrestaurants columns:", restCols.map(c => c.Field).join(", "));

    const [userCols] = await pool.query("SHOW COLUMNS FROM users");
    console.log("users columns:", userCols.map(c => c.Field).join(", "));

    const [dealCols] = await pool.query("SHOW COLUMNS FROM deals");
    console.log("deals columns:", dealCols.map(c => c.Field).join(", "));

    // Test the exact stats query
    const [[stats]] = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE role='customer') as totalCustomers,
        (SELECT COUNT(*) FROM restaurants) as totalRestaurants,
        (SELECT COUNT(*) FROM orders) as totalOrders
    `);
    console.log("\nStats query result:", stats);

    console.log("\n✅ All checks passed");
  } catch (e) {
    console.error("❌ Error:", e.message);
    console.error("SQL:", e.sqlMessage || "");
  }
  process.exit(0);
}
check();
