require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const pool = require("../config/db");

(async () => {
  try {
    console.log("Expanding orders.status ENUM constraint natively...");
    await pool.query(
      `ALTER TABLE orders MODIFY status ENUM('pending', 'accepted', 'preparing', 'ready', 'completed', 'rejected') DEFAULT 'pending'`
    );
    console.log("✅ orders.status updated successfully.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    process.exit(0);
  }
})();
