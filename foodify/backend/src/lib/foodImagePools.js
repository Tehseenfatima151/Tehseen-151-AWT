/**
 * Smart food image mapping: Unsplash URLs verified via GET (avoid removed legacy photo IDs).
 * Used by smart_upgrade_food_images migration (UPDATE image_url only when safe).
 */

const Q = "?q=80&w=900&h=600&fit=crop";
const u = (slug) => `https://images.unsplash.com/photo-${slug}${Q}`;

const MENU_POOLS = {
  biryani: [
    u("1631515243349-e0cb75fb8d3a"),
    u("1633945274405-b6c8069047b0"),
    u("1543353071-873f17a7a088"),
    u("1585937421612-70a008356fbe"),
  ],
  pulao: [
    u("1589302168068-964664d93dc0"),
    u("1604908176997-125f25cc6f3d"),
    u("1466978913421-dad2ebd01d17"),
    u("1504674900247-0877df9cc836"),
  ],
  burger: [
    u("1568901346375-23c9450c58cd"),
    u("1553979459-d2229ba7433b"),
    u("1550547660-d9450f859349"),
    u("1586190848861-99aa4a171e90"),
    u("1571091718767-18b5b1457add"),
    u("1561758033-d89a9ad46330"),
  ],
  pizza: [
    u("1513104890138-7c749659a591"),
    u("1565299624946-b28f40a0ae38"),
    u("1628840042765-356cda07504e"),
    u("1574071318508-1cdbab80d002"),
  ],
  pasta: [
    u("1563379926898-05f4575a45d8"),
    u("1645112411341-6c4fd023714a"),
    u("1473093295043-cdd812d0e601"),
  ],
  paratha: [
    u("1601050690597-df0568f70950"),
    u("1606491956689-2ea866880c84"),
    u("1589647363585-f4a7d3877b10"),
    u("1573140247632-f8fd74997d5c"),
  ],
  bread: [
    u("1573140247632-f8fd74997d5c"),
    u("1601050690597-df0568f70950"),
    u("1589647363585-f4a7d3877b10"),
    u("1606491956689-2ea866880c84"),
  ],
  fried_snack: [
    u("1544025162-d76694265947"),
    u("1563245372-f21724e3856d"),
    u("1546833998-877b37c2e5c6"),
  ],
  ice_cream: [
    u("1497034825429-c343d7c6a68f"),
    u("1606890737304-57a1ca8a5b62"),
    u("1488477181946-6428a0291777"),
    u("1578985545062-69928b1d9587"),
  ],
  dessert: [
    u("1533134242443-d4fd215305ad"),
    u("1606890737304-57a1ca8a5b62"),
    u("1578985545062-69928b1d9587"),
    u("1488477181946-6428a0291777"),
    u("1504754524776-8f4f37790ca0"),
  ],
  fries: [u("1585699324551-f6c309eedeca"), u("1544025162-d76694265947")],
  grill_meat: [
    u("1626700051175-6818013e1d4f"),
    u("1544025162-d76694265947"),
    u("1606491956689-2ea866880c84"),
    u("1626082927389-6cd097cdc6ec"),
  ],
  paneer: [u("1598514982205-f36b96d1e8d4"), u("1588166524941-3bf61a9c41db")],
  desi_curry: [
    u("1546833999-b9f581a1996d"),
    u("1585937421612-70a008356fbe"),
    u("1543339308-43e59d6b73a6"),
    u("1574894709920-11b28e7367e3"),
    u("1588166524941-3bf61a9c41db"),
    u("1604908176997-125f25cc6f3d"),
    u("1633945274405-b6c8069047b0"),
  ],
  south_indian: [
    u("1668236543090-82eba5ee5976"),
    u("1610194352361-4c81a6a8967e"),
    u("1589302168068-964664d93dc0"),
    u("1504674900247-0877df9cc836"),
  ],
  drinks: [
    u("1513558161293-cdaf765ed2fd"),
    u("1556881286-fc6915169721"),
    u("1490818387583-1baba5e638af"),
  ],
  desi_breakfast: [
    u("1589118949245-7d38baf380d6"),
    u("1543339308-43e59d6b73a6"),
    u("1601050690597-df0568f70950"),
    u("1589647363585-f4a7d3877b10"),
  ],
  salad: [
    u("1512621776951-a57141f2eefd"),
    u("1490645935967-10de6ba17061"),
    u("1546833998-877b37c2e5c6"),
  ],
  chinese: [
    u("1525755662778-989d0524087e"),
    u("1585032226651-759b368d7246"),
    u("1603133872878-684f208fb84b"),
    u("1555126634-323283e090fa"),
  ],
  fried_chicken: [
    u("1626082927389-6cd097cdc6ec"),
    u("1562967914-608f82629710"),
    u("1541592106381-b31e9677c0e5"),
    u("1561758033-d89a9ad46330"),
  ],
  sandwich: [
    u("1509722747041-616f39b57569"),
    u("1528736235302-52922df5c122"),
    u("1550547660-d9450f859349"),
    u("1571091718767-18b5b1457add"),
  ],
  wrap: [
    u("1525351484163-7529414344d8"),
    u("1626700051175-6818013e1d4f"),
    u("1509722747041-616f39b57569"),
  ],
  rice_generic: [
    u("1589302168068-964664d93dc0"),
    u("1604908176997-125f25cc6f3d"),
    u("1466978913421-dad2ebd01d17"),
    u("1633945274405-b6c8069047b0"),
  ],
  coleslaw_sides: [u("1625944525533-473f1a3d54e7"), u("1512621776951-a57141f2eefd")],
  cookies: [u("1499636136210-6f4ee915583e"), u("1558961363-fa8fdf82db35")],
  generic_plate: [
    u("1546069901-ba9599a7e63c"),
    u("1504674900247-0877df9cc836"),
    u("1504754524776-8f4f37790ca0"),
    u("1517248135467-4c7edcad34c4"),
    u("1464349095431-e9a21285b5f3"),
  ],
};

const RESTAURANT_POOLS = {
  biryani: [u("1631515243349-e0cb75fb8d3a"), u("1633945274405-b6c8069047b0"), u("1585937421612-70a008356fbe")],
  pakistani: [u("1585937421612-70a008356fbe"), u("1546833999-b9f581a1996d"), u("1606491956689-2ea866880c84")],
  burger: [u("1571091718767-18b5b1457add"), u("1568901346375-23c9450c58cd"), u("1550547660-d9450f859349")],
  pizza: [u("1513104890138-7c749659a591"), u("1565299624946-b28f40a0ae38"), u("1628840042765-356cda07504e")],
  pasta: [u("1473093295043-cdd812d0e601"), u("1563379926898-05f4575a45d8"), u("1645112411341-6c4fd023714a")],
  chinese: [u("1525755662778-989d0524087e"), u("1585032226651-759b368d7246"), u("1603133872878-684f208fb84b")],
  dessert: [u("1488477181946-6428a0291777"), u("1533134242443-d4fd215305ad"), u("1497034825429-c343d7c6a68f")],
  healthy: [u("1490645935967-10de6ba17061"), u("1512621776951-a57141f2eefd"), u("1546833998-877b37c2e5c6")],
  breakfast: [u("1589647363585-f4a7d3877b10"), u("1601050690597-df0568f70950"), u("1589118949245-7d38baf380d6")],
  shawarma: [u("1626700051175-6818013e1d4f"), u("1606491956689-2ea866880c84"), u("1626082927389-6cd097cdc6ec")],
  haleem: [u("1574894709920-11b28e7367e3"), u("1543339308-43e59d6b73a6"), u("1589302168068-964664d93dc0")],
  drinks: [u("1513558161293-cdaf765ed2fd"), u("1556881286-fc6915169721"), u("1490818387583-1baba5e638af")],
  bakery: [u("1464349095431-e9a21285b5f3"), u("1558961363-fa8fdf82db35"), u("1499636136210-6f4ee915583e")],
  fried_chicken: [u("1626082927389-6cd097cdc6ec"), u("1562967914-608f82629710"), u("1561758033-d89a9ad46330")],
  sandwich_shop: [u("1509722747041-616f39b57569"), u("1528736235302-52922df5c122"), u("1550547660-d9450f859349")],
  fast_food: [u("1568901346375-23c9450c58cd"), u("1585699324551-f6c309eedeca"), u("1586190848861-99aa4a171e90")],
  generic_eatery: [u("1517248135467-4c7edcad34c4"), u("1546069901-ba9599a7e63c"), u("1504754524776-8f4f37790ca0")],
};

const MENU_RULES = [
  [/\b(biryani)\b/i, "biryani"],
  [/\b(pulao|pilaf|pilau)\b/i, "pulao"],
  [/\b(pizza)\b/i, "pizza"],
  [/\b(pasta|spaghetti|penne|fettuccine|lasagne|lasagna|carbonara|arrabbiata|alfredo|linguine|ravioli|bolognese)\b/i, "pasta"],
  [/\b(dim\s*sum|chow\s*mein|kung\s*pao|fried\s*rice|noodles|spring\s*roll)\b/i, "chinese"],
  [/\b(masala\s*dosa|dosa|idli|uttapam)\b/i, "south_indian"],
  [/\b(paneer)\b/i, "paneer"],
  [/\b(samosa|pakora|pakoda)\b/i, "fried_snack"],
  [/\b(ice\s*cream|gelato|sundae|soft\s*serve|flurry)\b/i, "ice_cream"],
  [/\b(waffle|cheesecake|brownie|lava\s*cake|choco|macaron|croissant|tiramisu|panna\s*cotta|gulab|jamun|kheer|nutella)\b/i, "dessert"],
  [/\b(cookie)\b/i, "cookies"],
  [/\b(milkshake|lassi|juice|smoothie|lemonade|blast|frenzy|detox|sparkling|drink|watermelon|mango frenzy)\b/i, "drinks"],
  [/\b(halwa|puri|channay|chana|nihari|paye)\b/i, "desi_breakfast"],
  [/\b(haleem|khichri|khichdi)\b/i, "desi_curry"],
  [/\b(fries|fry)\b/i, "fries"],
  [/\b(coleslaw)\b/i, "coleslaw_sides"],
  [/\b(shawarma|kebab|kabab|seekh)\b/i, "grill_meat"],
  [/\b(butter\s*chicken|karahi|korma|daal|dal|dal\s|curry|mix\s*daal|nihari|chargha|tikka)\b/i, "desi_curry"],
  [/\b(zinger|burger|smash|patty|whopper|big\s*stack|mcchicken)\b/i, "burger"],
  [/\b(wings?|nuggets|bucket|fried\s*chicken)\b/i, "fried_chicken"],
  [/\b(sub|sandwich|bmt|tuna\s*melt|footlong)\b/i, "sandwich"],
  [/\b(wrap|burrito)\b/i, "wrap"],
  [/\b(garlic\s*bread|naan|roti|chapati|ciabatta|breadsticks?)\b/i, "bread"],
  [/\b(paratha)\b/i, "paratha"],
  [/\b(caesar|salad|raita|quinoa\s*bowl|power\s*bowl)\b/i, "salad"],
  [/\b(avocado\s*toast|avo\s*toast)\b/i, "salad"],
  [/\b(rice)\b/i, "rice_generic"],
];

function classifyMenuItemName(name) {
  const n = String(name || "");
  for (const [re, key] of MENU_RULES) {
    if (re.test(n)) return key;
  }
  return "generic_plate";
}

function classifyRestaurant(category, restName) {
  const c = String(category || "").toLowerCase();
  const n = String(restName || "").toLowerCase();
  const t = `${c} ${n}`;
  if (/\bpizza\b/.test(t)) return "pizza";
  if (/\bpasta\b/.test(t)) return "pasta";
  if (/\bchinese\b/.test(t)) return "chinese";
  if (/\bbiryani\b/.test(t)) return "biryani";
  if (/\bpakistani\b/.test(t)) return "pakistani";
  if (/\bburgers?\b/.test(t)) return "burger";
  if (/\bshawarma\b/.test(t)) return "shawarma";
  if (/\bhaleem\b/.test(t)) return "haleem";
  if (/\bparatha\b|\bhalwa\b|\bpuri\b/.test(t)) return "breakfast";
  if (/\bice\s*cream\b|\bdesserts?\b|\bcake\b|\bbakery\b/.test(t))
    return /\bbakery\b/.test(t) ? "bakery" : "dessert";
  if (/\bdrinks\b|\bjuice\b/.test(t)) return "drinks";
  if (/\bhealthy\b/.test(t)) return "healthy";
  if (/\bfast\s*food\b/.test(t)) {
    if (/kfc|chicken|wing|corner/.test(n)) return "fried_chicken";
    if (/sub|station|sandwich/.test(n)) return "sandwich_shop";
    return "fast_food";
  }
  return "generic_eatery";
}

function extractPhotoId(url) {
  if (!url || typeof url !== "string") return null;
  const m = url.match(/photo-([^?&#]+)/);
  return m ? m[1] : null;
}

function poolContainsPhotoId(pool, photoId) {
  if (!photoId || !pool?.length) return false;
  return pool.some((p) => p.includes(photoId));
}

function hashString(s) {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function pickFromPool(pool, id, name, usedUrls) {
  const p = pool?.length ? pool : MENU_POOLS.generic_plate;
  const base = (Number(id) * 7919 + hashString(String(name || ""))) >>> 0;
  let idx = base % p.length;
  let tries = 0;
  while (usedUrls.has(p[idx]) && tries < p.length) {
    idx = (idx + 1) % p.length;
    tries += 1;
  }
  const url = p[idx];
  usedUrls.add(url);
  return url;
}

function shouldUpdateMenuImage(imageUrl, _itemName, categoryKey) {
  if (!imageUrl || !String(imageUrl).trim()) return true;
  const uStr = String(imageUrl);
  if (!uStr.includes("images.unsplash.com")) return false;
  const pid = extractPhotoId(uStr);
  const pool = MENU_POOLS[categoryKey] || MENU_POOLS.generic_plate;
  if (pid && poolContainsPhotoId(pool, pid)) return false;
  return true;
}

function shouldUpdateRestaurantImage(imageUrl, poolKey) {
  if (!imageUrl || !String(imageUrl).trim()) return true;
  const uStr = String(imageUrl);
  if (!uStr.includes("images.unsplash.com")) return false;
  const pid = extractPhotoId(uStr);
  const pool = RESTAURANT_POOLS[poolKey] || RESTAURANT_POOLS.generic_eatery;
  if (pid && poolContainsPhotoId(pool, pid)) return false;
  return true;
}

module.exports = {
  MENU_POOLS,
  RESTAURANT_POOLS,
  classifyMenuItemName,
  classifyRestaurant,
  extractPhotoId,
  pickFromPool,
  shouldUpdateMenuImage,
  shouldUpdateRestaurantImage,
  poolContainsPhotoId,
};
