require("dotenv").config();
const pool = require("../src/config/db");

async function check() {
  try {
    // 1. Verify riders table exists
    const [cols] = await pool.query("SHOW COLUMNS FROM riders");
    console.log("riders columns:", cols.map(c => c.Field).join(", "));

    // 2. Verify orders has new columns
    const [oCols] = await pool.query("SHOW COLUMNS FROM orders LIKE 'assigned_rider_id'");
    const [dCols] = await pool.query("SHOW COLUMNS FROM orders LIKE 'delivery_status'");
    console.log("orders.assigned_rider_id:", oCols.length ? "EXISTS" : "MISSING");
    console.log("orders.delivery_status:", dCols.length ? "EXISTS" : "MISSING");

    // 3. Test stats query
    const [[stats]] = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM riders) AS totalRiders,
        (SELECT COUNT(*) FROM riders WHERE availability='online' AND is_active=1) AS onlineRiders,
        (SELECT COUNT(*) FROM riders WHERE is_active=1) AS activeRiders,
        (SELECT COALESCE(SUM(rider_tip),0) FROM orders) AS totalTips,
        (SELECT COUNT(*) FROM orders WHERE delivery_status='delivered' AND DATE(created_at)=CURDATE()) AS deliveriesToday
    `);
    console.log("Stats query:", stats);

    // 4. Test getAllRiders query
    const [riders] = await pool.query(`
      SELECT r.*,
        (SELECT COUNT(*) FROM orders o WHERE o.assigned_rider_id = r.id) AS total_deliveries,
        (SELECT COUNT(*) FROM orders o WHERE o.assigned_rider_id = r.id AND DATE(o.created_at) = CURDATE()) AS deliveries_today,
        (SELECT COALESCE(SUM(o.rider_tip),0) FROM orders o WHERE o.assigned_rider_id = r.id) AS total_tips,
        (SELECT COUNT(*) FROM orders o WHERE o.assigned_rider_id = r.id AND o.delivery_status = 'delivered') AS completed_deliveries
      FROM riders r ORDER BY r.id DESC
    `);
    console.log("Riders count:", riders.length);

    console.log("\n✅ All rider queries passed!");
  } catch (e) {
    console.error("❌ Error:", e.message);
    console.error("SQL:", e.sqlMessage || "");
  }
  process.exit(0);
}
check();
