/**
 * Migration: add_riders
 * - Creates riders table
 * - Adds assigned_rider_id + delivery_status to orders
 */
require("dotenv").config({ path: require("path").join(__dirname, "../../../.env") });
const pool = require("../config/db");

async function run() {
  const conn = await pool.getConnection();
  try {
    console.log("Running riders migration...");

    // 1. Create riders table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS riders (
        id            INT AUTO_INCREMENT PRIMARY KEY,
        name          VARCHAR(150) NOT NULL,
        phone         VARCHAR(30)  NOT NULL,
        email         VARCHAR(150) DEFAULT NULL,
        cnic          VARCHAR(20)  DEFAULT NULL,
        vehicle_type  ENUM('bike','bicycle','car') NOT NULL DEFAULT 'bike',
        vehicle_number VARCHAR(30) DEFAULT NULL,
        image_url     VARCHAR(500) DEFAULT NULL,
        availability  ENUM('online','offline') NOT NULL DEFAULT 'offline',
        is_active     TINYINT(1)  NOT NULL DEFAULT 1,
        created_at    TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✓ riders table created");

    // 2. Add assigned_rider_id to orders
    const [riderCol] = await conn.query(`SHOW COLUMNS FROM orders LIKE 'assigned_rider_id'`);
    if (!riderCol.length) {
      await conn.query(`ALTER TABLE orders ADD COLUMN assigned_rider_id INT DEFAULT NULL`);
      await conn.query(`ALTER TABLE orders ADD CONSTRAINT fk_order_rider FOREIGN KEY (assigned_rider_id) REFERENCES riders(id) ON DELETE SET NULL`);
      console.log("✓ orders.assigned_rider_id added");
    } else {
      console.log("- orders.assigned_rider_id already exists");
    }

    // 3. Add delivery_status to orders
    const [delivCol] = await conn.query(`SHOW COLUMNS FROM orders LIKE 'delivery_status'`);
    if (!delivCol.length) {
      await conn.query(`
        ALTER TABLE orders ADD COLUMN delivery_status
          ENUM('pending','confirmed','preparing','picked_up','on_the_way','delivered')
          NOT NULL DEFAULT 'pending'
      `);
      console.log("✓ orders.delivery_status added");
    } else {
      console.log("- orders.delivery_status already exists");
    }

    console.log("\n✅ Riders migration complete!");
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  } finally {
    conn.release();
    process.exit(0);
  }
}

run();
