/**
 * Migration: add_admin_role
 * - Adds 'admin' to users.role ENUM
 * - Adds is_active, is_top_shop, is_featured columns to restaurants
 * - Adds is_blocked column to users
 * - Adds is_featured column to deals
 */

require("dotenv").config({ path: require("path").join(__dirname, "../../../.env") });
const pool = require("../config/db");

async function run() {
  const conn = await pool.getConnection();
  try {
    console.log("Running admin role migration...");

    // 1. Modify users.role ENUM to include 'admin'
    await conn.query(`
      ALTER TABLE users
      MODIFY COLUMN role ENUM('customer', 'restaurant', 'admin') NOT NULL DEFAULT 'customer'
    `);
    console.log("✓ users.role ENUM updated to include 'admin'");

    // 2. Add is_blocked to users
    const [userCols] = await conn.query(`SHOW COLUMNS FROM users LIKE 'is_blocked'`);
    if (!userCols.length) {
      await conn.query(`ALTER TABLE users ADD COLUMN is_blocked TINYINT(1) NOT NULL DEFAULT 0`);
      console.log("✓ users.is_blocked added");
    } else {
      console.log("- users.is_blocked already exists");
    }

    // 3. Add is_active to restaurants
    const [activeCols] = await conn.query(`SHOW COLUMNS FROM restaurants LIKE 'is_active'`);
    if (!activeCols.length) {
      await conn.query(`ALTER TABLE restaurants ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1`);
      console.log("✓ restaurants.is_active added");
    } else {
      console.log("- restaurants.is_active already exists");
    }

    // 4. Add is_top_shop to restaurants
    const [topShopCols] = await conn.query(`SHOW COLUMNS FROM restaurants LIKE 'is_top_shop'`);
    if (!topShopCols.length) {
      await conn.query(`ALTER TABLE restaurants ADD COLUMN is_top_shop TINYINT(1) NOT NULL DEFAULT 0`);
      console.log("✓ restaurants.is_top_shop added");
    } else {
      console.log("- restaurants.is_top_shop already exists");
    }

    // 5. Add top_shop_order to restaurants
    const [topShopOrderCols] = await conn.query(`SHOW COLUMNS FROM restaurants LIKE 'top_shop_order'`);
    if (!topShopOrderCols.length) {
      await conn.query(`ALTER TABLE restaurants ADD COLUMN top_shop_order INT NOT NULL DEFAULT 0`);
      console.log("✓ restaurants.top_shop_order added");
    } else {
      console.log("- restaurants.top_shop_order already exists");
    }

    // 6. Add is_featured to restaurants (for home chefs featured)
    const [featuredCols] = await conn.query(`SHOW COLUMNS FROM restaurants LIKE 'is_featured'`);
    if (!featuredCols.length) {
      await conn.query(`ALTER TABLE restaurants ADD COLUMN is_featured TINYINT(1) NOT NULL DEFAULT 0`);
      console.log("✓ restaurants.is_featured added");
    } else {
      console.log("- restaurants.is_featured already exists");
    }

    // 7. Add is_featured to deals
    const [dealFeaturedCols] = await conn.query(`SHOW COLUMNS FROM deals LIKE 'is_featured'`);
    if (!dealFeaturedCols.length) {
      await conn.query(`ALTER TABLE deals ADD COLUMN is_featured TINYINT(1) NOT NULL DEFAULT 0`);
      console.log("✓ deals.is_featured added");
    } else {
      console.log("- deals.is_featured already exists");
    }

    // 8. Create top_brands table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS top_brands (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        image_url VARCHAR(500) DEFAULT NULL,
        restaurant_id INT DEFAULT NULL,
        display_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE SET NULL
      )
    `);
    console.log("✓ top_brands table created (or already exists)");

    console.log("\n✅ Migration complete!");
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  } finally {
    conn.release();
    process.exit(0);
  }
}

run();
