/**
 * Smart image upgrade: UPDATE image_url only (no deletes). Skips non-Unsplash URLs (e.g. /uploads/).
 * Run: node backend/src/migrations/smart_upgrade_food_images.js
 */
require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const pool = require("../config/db");
const {
  MENU_POOLS,
  RESTAURANT_POOLS,
  classifyMenuItemName,
  classifyRestaurant,
  pickFromPool,
  shouldUpdateMenuImage,
  shouldUpdateRestaurantImage,
} = require("../lib/foodImagePools");

async function upgradeMenuItems() {
  const [rows] = await pool.query("SELECT id, name, image_url FROM menu_items ORDER BY id");
  const usedUrls = new Set();
  let updated = 0;
  for (const row of rows) {
    const categoryKey = classifyMenuItemName(row.name);
    const poolArr = MENU_POOLS[categoryKey] || MENU_POOLS.generic_plate;
    if (!shouldUpdateMenuImage(row.image_url, row.name, categoryKey)) continue;
    const newUrl = pickFromPool(poolArr, row.id, row.name, usedUrls);
    await pool.query("UPDATE menu_items SET image_url = ? WHERE id = ?", [newUrl, row.id]);
    updated += 1;
  }
  return updated;
}

async function dedupeMenuItemImages() {
  const [rows] = await pool.query(
    "SELECT id, name, image_url FROM menu_items WHERE image_url LIKE ? ORDER BY id",
    ["%images.unsplash.com%"]
  );
  const byUrl = new Map();
  for (const r of rows) {
    if (!byUrl.has(r.image_url)) byUrl.set(r.image_url, []);
    byUrl.get(r.image_url).push(r);
  }
  const used = new Set(rows.map((r) => r.image_url));
  let fixed = 0;
  for (const group of byUrl.values()) {
    if (group.length < 2) continue;
    for (let i = 1; i < group.length; i += 1) {
      const row = group[i];
      const categoryKey = classifyMenuItemName(row.name);
      const poolArr = MENU_POOLS[categoryKey] || MENU_POOLS.generic_plate;
      const newUrl = pickFromPool(poolArr, row.id, `${row.name}-dedupe-${i}`, used);
      await pool.query("UPDATE menu_items SET image_url = ? WHERE id = ?", [newUrl, row.id]);
      used.add(newUrl);
      fixed += 1;
    }
  }
  return fixed;
}

async function upgradeRestaurants() {
  const [rows] = await pool.query("SELECT id, name, category, image_url FROM restaurants ORDER BY id");
  const usedUrls = new Set();
  let updated = 0;
  for (const row of rows) {
    const poolKey = classifyRestaurant(row.category, row.name);
    const poolArr = RESTAURANT_POOLS[poolKey] || RESTAURANT_POOLS.generic_eatery;
    if (!shouldUpdateRestaurantImage(row.image_url, poolKey)) continue;
    const newUrl = pickFromPool(poolArr, row.id, row.name, usedUrls);
    await pool.query("UPDATE restaurants SET image_url = ? WHERE id = ?", [newUrl, row.id]);
    updated += 1;
  }
  return updated;
}

async function dedupeRestaurantImages() {
  const [rows] = await pool.query(
    "SELECT id, name, category, image_url FROM restaurants WHERE image_url LIKE ? ORDER BY id",
    ["%images.unsplash.com%"]
  );
  const byUrl = new Map();
  for (const r of rows) {
    if (!byUrl.has(r.image_url)) byUrl.set(r.image_url, []);
    byUrl.get(r.image_url).push(r);
  }
  const used = new Set(rows.map((r) => r.image_url));
  let fixed = 0;
  for (const group of byUrl.values()) {
    if (group.length < 2) continue;
    for (let i = 1; i < group.length; i += 1) {
      const row = group[i];
      const poolKey = classifyRestaurant(row.category, row.name);
      const poolArr = RESTAURANT_POOLS[poolKey] || RESTAURANT_POOLS.generic_eatery;
      const newUrl = pickFromPool(poolArr, row.id, `${row.name}-rdedupe-${i}`, used);
      await pool.query("UPDATE restaurants SET image_url = ? WHERE id = ?", [newUrl, row.id]);
      used.add(newUrl);
      fixed += 1;
    }
  }
  return fixed;
}

async function printSamples() {
  const [burgers] = await pool.query(
    "SELECT name, image_url FROM menu_items WHERE name LIKE ? OR name LIKE ? LIMIT 6",
    ["%Burger%", "%Zinger%"]
  );
  const [biryanis] = await pool.query(
    "SELECT name, image_url FROM menu_items WHERE name LIKE ? LIMIT 6",
    ["%Biryani%"]
  );
  console.log("\n── Sample burgers / chicken sandwiches ──");
  burgers.forEach((b) => console.log(`  ${b.name} → ${b.image_url.slice(0, 72)}…`));
  console.log("── Sample biryani ──");
  biryanis.forEach((b) => console.log(`  ${b.name} → ${b.image_url.slice(0, 72)}…`));
}

(async () => {
  let code = 0;
  try {
    console.log("Smart food image upgrade (UPDATE image_url only)…\n");
    const m1 = await upgradeMenuItems();
    const m2 = await dedupeMenuItemImages();
    const r1 = await upgradeRestaurants();
    const r2 = await dedupeRestaurantImages();
    console.log(`Menu items updated (classification): ${m1}`);
    console.log(`Menu items deduped:              ${m2}`);
    console.log(`Restaurants updated:             ${r1}`);
    console.log(`Restaurants deduped:             ${r2}`);
    await printSamples();
    console.log("\nDone.");
  } catch (e) {
    console.error("smart_upgrade_food_images failed:", e.message);
    console.error(e);
    code = 1;
  } finally {
    await pool.end().catch(() => {});
    process.exit(code);
  }
})();
