require("dotenv").config({ path: require("path").resolve(__dirname, "../../../.env") });
const pool = require("../config/db");

(async () => {
  try {
    const [rests] = await pool.query("SELECT id, name, category, brand, is_home_chef FROM restaurants ORDER BY id");
    console.log("\n=== ALL RESTAURANTS ===");
    rests.forEach(r =>
      console.log("  [" + r.id + "] " + String(r.name).padEnd(22) +
        " cat=" + String(r.category || "?").padEnd(12) +
        " brand=" + String(r.brand || "-").padEnd(16) +
        " home_chef=" + r.is_home_chef)
    );

    const [cats] = await pool.query("SELECT category, COUNT(*) as cnt FROM restaurants GROUP BY category");
    console.log("\n=== CATEGORY COUNTS ===");
    cats.forEach(c => console.log("  " + String(c.category || "null").padEnd(14) + " : " + c.cnt));

    const [brands] = await pool.query("SELECT brand, COUNT(*) as cnt FROM restaurants WHERE brand IS NOT NULL GROUP BY brand");
    console.log("\n=== BRAND COUNTS ===");
    brands.forEach(b => console.log("  " + String(b.brand || "null").padEnd(18) + " : " + b.cnt));

    const [menus] = await pool.query(
      "SELECT r.name, COUNT(m.id) as items FROM restaurants r LEFT JOIN menu_items m ON m.restaurant_id = r.id GROUP BY r.id ORDER BY r.id"
    );
    console.log("\n=== MENU ITEMS PER RESTAURANT ===");
    menus.forEach(m => console.log("  " + String(m.name).padEnd(22) + " : " + m.items + " items"));

    console.log("");
  } catch (e) {
    console.error("ERR:", e.message);
  } finally {
    process.exit(0);
  }
})();
