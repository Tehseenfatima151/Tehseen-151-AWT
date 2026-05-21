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

(async () => {
  try {
    console.log("Ensuring deals table (create + upgrade legacy schema)...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS deals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        restaurant_id INT NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        discount DECIMAL(5,2) NOT NULL DEFAULT 0,
        image_url VARCHAR(500) DEFAULT NULL,
        menu_item_ids TEXT DEFAULT NULL,
        valid_from DATE DEFAULT NULL,
        valid_until DATE DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
      )
    `);

    /* Legacy: seed_more.js created deals with discount_text / img_url / theme — INSERTs need discount + image_url */
    if (!(await columnExists("deals", "discount"))) {
      console.log("  → Adding column discount (upgrade from old schema)...");
      await pool.query("ALTER TABLE deals ADD COLUMN discount DECIMAL(5,2) NOT NULL DEFAULT 10");
    }
    if (!(await columnExists("deals", "image_url"))) {
      console.log("  → Adding column image_url...");
      await pool.query("ALTER TABLE deals ADD COLUMN image_url VARCHAR(500) DEFAULT NULL");
      if (await columnExists("deals", "img_url")) {
        await pool.query("UPDATE deals SET image_url = img_url WHERE img_url IS NOT NULL");
      }
    }
    if (!(await columnExists("deals", "menu_item_ids"))) {
      await pool.query("ALTER TABLE deals ADD COLUMN menu_item_ids TEXT DEFAULT NULL");
    }
    if (!(await columnExists("deals", "valid_from"))) {
      await pool.query("ALTER TABLE deals ADD COLUMN valid_from DATE DEFAULT NULL");
    }
    if (!(await columnExists("deals", "valid_until"))) {
      await pool.query("ALTER TABLE deals ADD COLUMN valid_until DATE DEFAULT NULL");
    }
    if (!(await columnExists("deals", "created_at"))) {
      await pool.query(
        "ALTER TABLE deals ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
      );
    }

    try {
      await pool.query("ALTER TABLE deals MODIFY description TEXT");
    } catch {
      /* ignore if not applicable */
    }

    console.log("✅ deals table ready.");
  } catch (err) {
    console.error("Migration failed", err);
  } finally {
    process.exit(0);
  }
})();
