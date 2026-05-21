/**
 * GET-check every unique photo id in foodImagePools (lightweight: read first byte).
 * Run: node backend/scripts/verify_unsplash_pools.js
 */
const https = require("https");
const { MENU_POOLS, RESTAURANT_POOLS } = require("../src/lib/foodImagePools");

function get(url) {
  return new Promise((resolve) => {
    const req = https.get(url, { timeout: 15000 }, (res) => {
      res.resume();
      resolve({ url, status: res.statusCode });
    });
    req.on("error", () => resolve({ url, status: "ERR" }));
    req.on("timeout", () => {
      req.destroy();
      resolve({ url, status: "TIMEOUT" });
    });
  });
}

(async () => {
  const urls = new Set();
  for (const pool of Object.values(MENU_POOLS)) pool.forEach((u) => urls.add(u));
  for (const pool of Object.values(RESTAURANT_POOLS)) pool.forEach((u) => urls.add(u));
  const list = [...urls];
  const bad = [];
  for (const u of list) {
    const r = await get(u);
    if (r.status !== 200) bad.push(r);
    process.stdout.write(r.status === 200 ? "." : "x");
  }
  console.log("\n\nTotal:", list.length, "Bad:", bad.length);
  bad.forEach((b) => console.log(b.status, b.url));
  process.exit(bad.length ? 1 : 0);
})();
