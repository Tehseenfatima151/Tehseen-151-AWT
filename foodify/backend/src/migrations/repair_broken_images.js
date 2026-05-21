/**
 * Replace clearly broken / blocked image URLs (e.g. Wikimedia). Does not flag valid Unsplash URLs.
 * Prefer smart_upgrade_food_images.js for name-based Unsplash fixes.
 */
require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const pool = require("../config/db");

const GOOD_IDS = {
  naan: "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?q=80&w=800&fit=crop",
  stew: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=800&fit=crop",
  drinks: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=800&fit=crop",
  cake: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=800&fit=crop",
  fried: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&fit=crop",
  salad: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&fit=crop",
  rice: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=800&fit=crop",
  default: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&fit=crop",
};

const getReplacement = (name) => {
  const n = name.toLowerCase();
  if (n.includes("paratha") || n.includes("naan") || n.includes("puri") || n.includes("bread")) return GOOD_IDS.naan;
  if (n.includes("haleem") || n.includes("nihari") || n.includes("daal") || n.includes("karahi")) return GOOD_IDS.stew;
  if (n.includes("juice") || n.includes("shake") || n.includes("drink")) return GOOD_IDS.drinks;
  if (n.includes("cake") || n.includes("dessert") || n.includes("sweet") || n.includes("halwa")) return GOOD_IDS.cake;
  if (n.includes("samosa") || n.includes("roll") || n.includes("fry") || n.includes("fries")) return GOOD_IDS.fried;
  if (n.includes("salad") || n.includes("veg") || n.includes("green") || n.includes("bowl")) return GOOD_IDS.salad;
  if (n.includes("biryani") || n.includes("rice") || n.includes("pulao")) return GOOD_IDS.rice;
  return GOOD_IDS.default;
};

const isBadUrl = (url) => {
  if (!url) return true;
  if (url.includes("wikimedia.org")) return true;
  if (url.includes("wikipedia.org")) return true;
  return false;
};

(async () => {
  console.log("Repairing broken menu_item images...");
  const [menus] = await pool.query("SELECT id, name, image_url FROM menu_items");
  let fixedMenus = 0;
  for (const m of menus) {
    if (isBadUrl(m.image_url)) {
      const replacementUrl = getReplacement(m.name);
      await pool.query("UPDATE menu_items SET image_url = ? WHERE id = ?", [replacementUrl, m.id]);
      fixedMenus += 1;
    }
  }
  console.log(`✅ Repaired ${fixedMenus} broken menu items.`);

  console.log("Repairing broken restaurant images...");
  const [rests] = await pool.query("SELECT id, name, category, image_url FROM restaurants");
  let fixedRests = 0;
  for (const r of rests) {
    if (isBadUrl(r.image_url)) {
      const replacementUrl = getReplacement(`${r.name} ${r.category}`);
      await pool.query("UPDATE restaurants SET image_url = ? WHERE id = ?", [replacementUrl, r.id]);
      fixedRests += 1;
    }
  }
  console.log(`✅ Repaired ${fixedRests} broken restaurants.`);
  process.exit(0);
})();
