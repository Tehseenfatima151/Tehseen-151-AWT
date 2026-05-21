require("dotenv").config();
const pool = require("../src/config/db");

async function check() {
  try {
    // Use exact same queries as the updated controller
    const [monthly] = await pool.query(
      `SELECT DATE_FORMAT(created_at,'%Y-%m') AS month,
              DATE_FORMAT(created_at,'%b %Y') AS label,
              COUNT(*) AS orders,
              COALESCE(SUM(total_price),0) AS revenue
       FROM orders
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
         AND (status IS NULL OR status != 'rejected')
       GROUP BY DATE_FORMAT(created_at,'%Y-%m')
       ORDER BY month ASC`
    );
    console.log("Monthly revenue rows:", monthly.length, monthly);

    const [status] = await pool.query(
      `SELECT CASE WHEN (status IS NULL OR status='') THEN 'pending' ELSE status END AS status,
              COUNT(*) AS count
       FROM orders
       GROUP BY CASE WHEN (status IS NULL OR status='') THEN 'pending' ELSE status END`
    );
    console.log("Status breakdown:", status);

    const [top] = await pool.query(
      `SELECT r.name, COUNT(o.id) AS orders, COALESCE(SUM(o.total_price),0) AS revenue
       FROM orders o JOIN restaurants r ON r.id = o.restaurant_id
       WHERE (o.status IS NULL OR o.status != 'rejected')
       GROUP BY r.id ORDER BY revenue DESC LIMIT 5`
    );
    console.log("Top restaurants:", top);

    console.log("\n✅ All chart queries passed!");
  } catch (e) {
    console.error("❌", e.message, e.sqlMessage || "");
  }
  process.exit(0);
}
check();
