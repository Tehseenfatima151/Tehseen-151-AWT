const pool = require("../config/db");

(async () => {
  console.log("\n🚀 Running orders table fee columns migration...");
  try {
    const addColumnSafe = async (columnDef) => {
      try {
        await pool.query(`ALTER TABLE orders ADD COLUMN ${columnDef}`);
        console.log(`✅ Added column definition: ${columnDef}`);
      } catch (err) {
        if (err.code === "ER_DUP_FIELDNAME" || err.message.includes("Duplicate column name")) {
          console.log(`ℹ️ Column already exists for definition: ${columnDef}`);
        } else {
          throw err;
        }
      }
    };

    await addColumnSafe("delivery_fee DECIMAL(10,2) DEFAULT 0.00");
    await addColumnSafe("service_fee DECIMAL(10,2) DEFAULT 0.00");
    await addColumnSafe("vat DECIMAL(10,2) DEFAULT 0.00");
    await addColumnSafe("rider_tip DECIMAL(10,2) DEFAULT 0.00");

    console.log("✅ Database migration complete!");
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
  } finally {
    process.exit(0);
  }
})();
