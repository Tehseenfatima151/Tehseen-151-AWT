require("dotenv").config();
const pool = require("../src/config/db");

async function check() {
  try {
    // Test exact getDashboardStats queries
    const [[{ totalCustomers }]] = await pool.query(`SELECT COUNT(*) AS totalCustomers FROM users WHERE role = 'customer'`);
    const [[{ totalRestaurants }]] = await pool.query(`SELECT COUNT(*) AS totalRestaurants FROM restaurants`);
    const [[{ totalOrders }]] = await pool.query(`SELECT COUNT(*) AS totalOrders FROM orders`);
    const [[{ activeDeals }]] = await pool.query(`SELECT COUNT(*) AS activeDeals FROM deals WHERE (valid_until IS NULL OR valid_until >= CURDATE()) AND (valid_from IS NULL OR valid_from <= CURDATE())`);
    const [[{ homeChefs }]] = await pool.query(`SELECT COUNT(*) AS homeChefs FROM restaurants WHERE is_home_chef = 1`);
    const [[{ topShops }]] = await pool.query(`SELECT COUNT(*) AS topShops FROM restaurants WHERE is_top_shop = 1`);
    const [[{ totalRevenue }]] = await pool.query(`SELECT COALESCE(SUM(total_price), 0) AS totalRevenue FROM orders WHERE status NOT IN ('rejected')`);
    const [[{ pendingOrders }]] = await pool.query(`SELECT COUNT(*) AS pendingOrders FROM orders WHERE status = 'pending'`);

    console.log("Stats:", { totalCustomers, totalRestaurants, totalOrders, activeDeals, homeChefs, topShops, totalRevenue, pendingOrders });

    const [recentOrders] = await pool.query(
      `SELECT o.id, o.total_price, o.status, o.created_at, o.payment_method,
              u.name AS customer_name, r.name AS restaurant_name
       FROM orders o JOIN users u ON u.id = o.user_id JOIN restaurants r ON r.id = o.restaurant_id
       ORDER BY o.created_at DESC LIMIT 10`
    );
    console.log("Recent orders count:", recentOrders.length);

    const [recentRestaurants] = await pool.query(
      `SELECT r.id, r.name, r.category, r.is_active,
              u.created_at, u.name AS owner_name, u.email AS owner_email
       FROM restaurants r JOIN users u ON u.id = r.user_id
       ORDER BY r.id DESC LIMIT 8`
    );
    console.log("Recent restaurants count:", recentRestaurants.length);

    console.log("\n✅ All stats queries passed!");
  } catch (e) {
    console.error("❌ Query failed:", e.message);
    console.error("SQL:", e.sqlMessage || "");
  }
  process.exit(0);
}
check();
