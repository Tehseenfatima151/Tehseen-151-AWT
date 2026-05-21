/**
 * Foodify Extended Seed — seed_more.js
 * ─────────────────────────────────────
 * 1. Creates `deals` table (safe – IF NOT EXISTS)
 * 2. Inserts restaurants for every new category
 *    (Biryani, Burgers, Halwa Puri, Paratha, Ice Cream,
 *     Pasta, Pulao, Shawarma, Haleem, Cake & Bakery, Drinks)
 * 3. Seeds 5 menu items per new restaurant
 * 4. Seeds 6 daily deals linked to real restaurant IDs
 *
 * Run: node backend/src/migrations/seed_more.js
 * Safe to re-run – prevents all duplicates via email/name checks.
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const bcrypt = require("bcryptjs");
const pool   = require("../config/db");

const log  = (msg) => console.log("  ✅", msg);
const warn = (msg) => console.log("  ⚠️ ", msg);

// ─── New restaurants for new categories with images ──────────────────────────
const NEW_RESTAURANTS = [
  { 
    email: "biryanihouse@foodify.demo",  ownerName: "Biryani House Owner",   name: "Biryani House",          desc: "Award-winning slow-cooked biryani with raita & salad",   category: "Biryani",       brand: null,            is_home_chef: false,
    image_url: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?q=80&w=600&h=400&fit=crop"
  },
  { 
    email: "burgerbros@foodify.demo",    ownerName: "Burger Bros Owner",      name: "Burger Bros",            desc: "Gourmet smash burgers with creative toppings",           category: "Burgers",       brand: null,            is_home_chef: false,
    image_url: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=500&h=300&fit=crop"
  },
  { 
    email: "desibreakfast@foodify.demo", ownerName: "Desi Breakfast",         name: "Desi Breakfast Corner",  desc: "Authentic halwa puri, channay & desi morning favourites", category: "Halwa Puri",    brand: null,            is_home_chef: true,
    image_url: "https://images.unsplash.com/photo-1589647363585-f4a7d3877b10?q=80&w=500&h=300&fit=crop"
  },
  { 
    email: "parathjct@foodify.demo",     ownerName: "Paratha Junction Owner", name: "Paratha Junction",       desc: "Crispy stuffed parathas – aloo, keema, chicken & more",  category: "Paratha",       brand: null,            is_home_chef: true,
    image_url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=600&h=400&fit=crop"
  },
  { 
    email: "chillzone@foodify.demo",     ownerName: "Chill Zone Owner",       name: "Chill Zone",             desc: "Premium ice creams, gelato, sundaes & shakes",           category: "Ice Cream",     brand: "Starbz-Style",  is_home_chef: false,
    image_url: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?q=80&w=500&h=300&fit=crop"
  },
  { 
    email: "pastaprimo@foodify.demo",    ownerName: "Pasta Primo Owner",      name: "Pasta Primo",            desc: "Authentic Italian pasta, risotto & wood-fired breads",   category: "Pasta",         brand: null,            is_home_chef: false,
    image_url: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?q=80&w=500&h=300&fit=crop"
  },
  { 
    email: "pulaopalace@foodify.demo",   ownerName: "Pulao Palace Owner",     name: "Pulao Palace",           desc: "Fragrant dum-cooked pulao – chicken, mutton & kabuli",   category: "Pulao",         brand: null,            is_home_chef: false,
    image_url: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=500&h=300&fit=crop"
  },
  { 
    email: "shawarmastar@foodify.demo",  ownerName: "Shawarma Star Owner",    name: "Shawarma Star",          desc: "Spit-roasted chicken & beef shawarma, wraps & platters", category: "Shawarma",      brand: null,            is_home_chef: false,
    image_url: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?q=80&w=500&h=300&fit=crop"
  },
  { 
    email: "haleemhub@foodify.demo",     ownerName: "Haleem Hub Owner",       name: "Haleem Hub",             desc: "Slow-simmered chicken & beef haleem, Lahori style",      category: "Haleem",        brand: null,            is_home_chef: false,
    image_url: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?q=80&w=500&h=300&fit=crop"
  },
  { 
    email: "bakecake@foodify.demo",      ownerName: "Bake & Cake Owner",      name: "Bake & Cake Shop",       desc: "Artisan cakes, pastries, croissants & macarons",         category: "Cake & Bakery", brand: null,            is_home_chef: false,
    image_url: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?q=80&w=500&h=300&fit=crop"
  },
  { 
    email: "juicebar@foodify.demo",      ownerName: "Juice Bar Owner",        name: "Juice Bar & Drinks",     desc: "Cold-pressed juices, smoothies & sparkling drinks",      category: "Drinks",        brand: "Starbz-Style",  is_home_chef: false,
    image_url: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=500&h=300&fit=crop"
  },
];

// Helper to quickly add image_url columns to a table
async function addImageUrlColumnSafe(table) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS cnt FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = 'image_url'`,
    [table]
  );
  if (rows[0].cnt === 0) {
    await pool.query(`ALTER TABLE ${table} ADD COLUMN image_url VARCHAR(500) DEFAULT NULL`);
    console.log(`  ✅ Added 'image_url' column to '${table}'.`);
  }
}

// ─── Menu items — prices in PKR (major-city delivery ballpark) ────────────────
const MENU = {
  "Biryani House": [
    { name: "Chicken Biryani Special",  price: 799.99, description: "House-recipe biryani with raita & green salad", image_url: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?q=80&w=400&h=400&fit=crop" },
    { name: "Mutton Biryani",           price: 999.99, description: "Slow-cooked bone-in mutton on aromatic basmati", image_url: "https://images.unsplash.com/photo-1543353071-873f17a7a088?q=80&w=400&h=400&fit=crop" },
    { name: "Prawn Biryani",            price: 1099.99, description: "Spiced prawn biryani with coconut milk sauce", image_url: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=400&h=400&fit=crop" },
    { name: "Vegetable Biryani",        price: 599.99, description: "Garden-fresh mixed vegetable biryani", image_url: "https://images.unsplash.com/photo-1515003322880-721269389e83?q=80&w=400&h=400&fit=crop" },
    { name: "Biryani Half Portion",     price: 499.99, description: "Half biryani with raita – perfect for one", image_url: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?q=80&w=400&h=400&fit=crop" },
  ],
  "Burger Bros": [
    { name: "Classic Smash Burger",    price: 749.99, description: "Double smash, gooey cheddar & caramelized onions", image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=300&h=300&fit=crop" },
    { name: "BBQ Bacon Burger",        price: 899.99, description: "Beef patty, crispy bacon, smoky BBQ sauce & pickles", image_url: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?q=80&w=300&h=300&fit=crop" },
    { name: "Mushroom Swiss",          price: 799.99, description: "Sautéed wild mushrooms & melted Swiss cheese", image_url: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=300&h=300&fit=crop" },
    { name: "Veggie Bean Burger",      price: 649.99, description: "Spiced black-bean patty with avocado & sriracha", image_url: "https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?q=80&w=300&h=300&fit=crop" },
    { name: "Double Trouble Burger",   price: 949.99, description: "Two smash patties, double cheese, secret sauce", image_url: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=300&h=300&fit=crop" },
  ],
  "Desi Breakfast Corner": [
    { name: "Halwa Puri Set",          price: 449.99, description: "2 puri, sooji halwa, spiced channa & aloo bhujia", image_url: "https://images.unsplash.com/photo-1589647363585-f4a7d3877b10?q=80&w=300&h=300&fit=crop" },
    { name: "Channay Wala Puri",       price: 399.99, description: "2 crispy puri with tangy spiced chickpeas", image_url: "https://images.unsplash.com/photo-1589647363585-f4a7d3877b10?q=80&w=300&h=300&fit=crop" },
    { name: "Paye Nihari",             price: 899.99, description: "Slow-cooked trotters in rich, aromatic gravy", image_url: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?q=80&w=300&h=300&fit=crop" },
    { name: "Aloo Bhujia Side",        price: 249.99, description: "Spiced potato dry curry side dish", image_url: "https://images.unsplash.com/photo-1589118949245-7d38baf380d6?q=80&w=300&h=300&fit=crop" },
    { name: "Lassi (Sweet)",           price: 229.99, description: "Thick & creamy traditional sweet yogurt drink", image_url: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=300&h=300&fit=crop" },
  ],
  "Paratha Junction": [
    { name: "Aloo Paratha",            price: 299.99, description: "Crispy potato-stuffed whole-wheat paratha", image_url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=400&h=400&fit=crop" },
    { name: "Keema Paratha",           price: 449.99, description: "Spiced minced beef stuffed layered paratha", image_url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=400&h=400&fit=crop" },
    { name: "Chicken Paratha Roll",    price: 549.99, description: "Grilled chicken wrapped in a fresh soft paratha", image_url: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?q=80&w=400&h=400&fit=crop" },
    { name: "Anday Wala Paratha",      price: 249.99, description: "Flaky paratha layered with fried egg", image_url: "https://images.unsplash.com/photo-1582860684824-3864700d84a7?q=80&w=400&h=400&fit=crop" },
    { name: "Makai Paratha",           price: 329.99, description: "Cornmeal paratha served with dahi & chutney", image_url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=400&h=400&fit=crop" },
  ],
  "Chill Zone": [
    { name: "Mango Sundae",            price: 649.99, description: "Soft serve with mango coulis & crispy wafer", image_url: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?q=80&w=300&h=300&fit=crop" },
    { name: "Strawberry Shake",        price: 599.99, description: "Real strawberry hand-blended milkshake", image_url: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=300&h=300&fit=crop" },
    { name: "Double Scoop Gelato",     price: 549.99, description: "Two scoops of premium Italian gelato", image_url: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?q=80&w=300&h=300&fit=crop" },
    { name: "Ice Cream Sandwich",      price: 699.99, description: "Cookie crumble ice cream sandwich bar", image_url: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?q=80&w=300&h=300&fit=crop" },
    { name: "Banana Split",            price: 949.99, description: "Classic 3-scoop banana split with all toppings", image_url: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?q=80&w=300&h=300&fit=crop" },
  ],
  "Pasta Primo": [
    { name: "Spaghetti Carbonara",     price: 1049.99, description: "Egg yolk, guanciale & pecorino – the original", image_url: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?q=80&w=300&h=300&fit=crop" },
    { name: "Lasagne al Forno",        price: 1149.99, description: "Oven-baked beef bolognese & béchamel lasagne", image_url: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?q=80&w=300&h=300&fit=crop" },
    { name: "Mushroom Fettuccine",     price: 949.99, description: "Wild mushroom cream sauce on fresh fettuccine", image_url: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?q=80&w=300&h=300&fit=crop" },
    { name: "Bruschetta (4 pcs)",      price: 449.99, description: "Grilled bread with tomato, fresh basil & garlic", image_url: "https://images.unsplash.com/photo-1572656631137-7935293645fb?q=80&w=300&h=300&fit=crop" },
    { name: "Panna Cotta",             price: 549.99, description: "Silky vanilla panna cotta with berry coulis", image_url: "https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=300&h=300&fit=crop" },
  ],
  "Pulao Palace": [
    { name: "Chicken Pulao",           price: 899.99, description: "Slow-cooked chicken stock rice with whole spices", image_url: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=300&h=300&fit=crop" },
    { name: "Mutton Pulao Special",    price: 1199.99, description: "Dum-cooked bone-in mutton pulao", image_url: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=300&h=300&fit=crop" },
    { name: "Kabuli Pulao",            price: 999.99, description: "Afghan-style beef, raisin & carrot pulao", image_url: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=300&h=300&fit=crop" },
    { name: "Vegetable Pulao",         price: 649.99, description: "Fragrant basmati with fresh seasonal vegetables", image_url: "https://images.unsplash.com/photo-1515003322880-721269389e83?q=80&w=300&h=300&fit=crop" },
    { name: "Pulao + Raita Combo",     price: 1049.99, description: "Full pulao plate with cool cucumber raita", image_url: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=300&h=300&fit=crop" },
  ],
  "Shawarma Star": [
    { name: "Chicken Shawarma Wrap",   price: 449.99, description: "Marinated chicken, garlic sauce, pickles & veggies", image_url: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?q=80&w=300&h=300&fit=crop" },
    { name: "Beef Shawarma Wrap",      price: 499.99, description: "Slow-roasted beef shawarma in lavash bread", image_url: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?q=80&w=300&h=300&fit=crop" },
    { name: "Shawarma Platter",        price: 949.99, description: "Mixed shawarma with hummus, rice & fresh salad", image_url: "https://images.unsplash.com/photo-1563379091339-03246ee2d2b6?q=80&w=300&h=300&fit=crop" },
    { name: "Shawarma Loaded Fries",   price: 599.99, description: "Fries topped with shawarma meat & garlic sauce", image_url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=300&h=300&fit=crop" },
    { name: "Double Shawarma Wrap",    price: 849.99, description: "Extra meat, extra sauce, double the flavour", image_url: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?q=80&w=300&h=300&fit=crop" },
  ],
  "Haleem Hub": [
    { name: "Chicken Haleem",          price: 649.99, description: "Slow-simmered chicken, wheat & lentil stew", image_url: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?q=80&w=300&h=300&fit=crop" },
    { name: "Beef Haleem",             price: 799.99, description: "Rich slow-cooked beef haleem with fried onion", image_url: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?q=80&w=300&h=300&fit=crop" },
    { name: "Haleem Sandwich",         price: 549.99, description: "Creamy haleem stuffed in a toasted bun", image_url: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=300&h=300&fit=crop" },
    { name: "Khichri",                 price: 499.99, description: "Comfort rice & lentil porridge with desi ghee", image_url: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=300&h=300&fit=crop" },
    { name: "Nihari + Haleem Combo",   price: 1049.99, description: "Classic Pakistani combination plate", image_url: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?q=80&w=300&h=300&fit=crop" },
  ],
  "Bake & Cake Shop": [
    { name: "Red Velvet Slice",        price: 549.99, description: "Moist red velvet with cream-cheese frosting", image_url: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?q=80&w=300&h=300&fit=crop" },
    { name: "Chocolate Truffle Cake",  price: 649.99, description: "Dark ganache & layered chocolate sponge", image_url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=300&h=300&fit=crop" },
    { name: "Blueberry Cheesecake",    price: 699.99, description: "New York style slice with blueberry compote", image_url: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=300&h=300&fit=crop" },
    { name: "Almond Croissant",        price: 399.99, description: "Buttery flaky croissant with almond cream", image_url: "https://images.unsplash.com/photo-1510816045579-3c735d49a710?q=80&w=300&h=300&fit=crop" },
    { name: "Macarons (6 pcs)",        price: 949.99, description: "French macarons in six assorted flavours", image_url: "https://images.unsplash.com/photo-1504113888839-1c8ec7ca7c21?q=80&w=300&h=300&fit=crop" },
  ],
  "Juice Bar & Drinks": [
    { name: "Watermelon Blast",        price: 229.99, description: "Fresh cold-pressed watermelon juice", image_url: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=300&h=300&fit=crop" },
    { name: "Mango Frenzy",            price: 279.99, description: "Authentic Alphonso mango blend", image_url: "https://images.unsplash.com/photo-1490818387583-1baba5e638af?q=80&w=300&h=300&fit=crop" },
    { name: "Green Detox",             price: 299.99, description: "Spinach, cucumber, ginger & apple juice", image_url: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=300&h=300&fit=crop" },
    { name: "Sparkling Lemonade",      price: 199.99, description: "Homemade fizzy lemon juice with fresh mint", image_url: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=300&h=300&fit=crop" },
    { name: "Avocado Banana Shake",    price: 449.99, description: "Thick avocado & banana protein shake", image_url: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=300&h=300&fit=crop" },
  ],
  "Spice Hub": [
    { name: "Mango Lassi",         price: 229.99, description: "Sweet yogurt-based chilled mango drink",     image_url: "https://images.unsplash.com/photo-1546833998-877b37c2e5c6?q=80&w=400&h=400&fit=crop" },
    { name: "Garlic Naan",         price: 149.99, description: "Freshly baked naan with garlic herb butter",  image_url: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=400&h=400&fit=crop" },
    { name: "Dal Makhani",         price: 449.99, description: "Slow-cooked creamy black lentil curry",        image_url: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=400&h=400&fit=crop" },
    { name: "Masala Dosa",         price: 549.99, description: "Crispy dosa with potato masala filling",      image_url: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=400&h=400&fit=crop" },
    { name: "Butter Chicken",      price: 899.99, description: "Classic tandoori chicken in creamy tomato gravy", image_url: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?q=80&w=400&h=400&fit=crop" },
    { name: "Paneer Tikka",        price: 599.99, description: "Grilled cottage cheese with spices",           image_url: "https://images.unsplash.com/photo-1567184109171-ec5793e3b693?q=80&w=400&h=400&fit=crop" },
  ],
};


// ─── Deals definitions (restaurant looked up by name) ────────────────────────
const DEAL_SEEDS = [
  {
    restaurantName: "KFC Corner",
    title:          "Half-Price Zinger Bucket!",
    discount_text:  "50% OFF",
    description:    "Limited time – grab 8 pcs for half the price",
    img_url:        "https://images.unsplash.com/photo-1562967914-608f82629710?q=80&w=400&h=200&fit=crop",
    theme: 0,
  },
  {
    restaurantName: "Pizza Palace",
    title:          "Buy 1 Get 1 Free Pizza",
    discount_text:  "2 FOR 1",
    description:    "Every Tuesday & Thursday on any medium pizza",
    img_url:        "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=400&h=200&fit=crop",
    theme: 2,
  },
  {
    restaurantName: "McBurger Shack",
    title:          "Free Delivery Weekend",
    discount_text:  "FREE DELIVERY",
    description:    "On all orders above Rs. 500 this weekend",
    img_url:        "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=400&h=200&fit=crop",
    theme: 1,
  },
  {
    restaurantName: "Biryani House",
    title:          "Biryani Feast Deal",
    discount_text:  "30% OFF",
    description:    "On all biryani orders above Rs. 800",
    img_url:        "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?q=80&w=400&h=200&fit=crop",
    theme: 3,
  },
  {
    restaurantName: "Sweet Corner",
    title:          "Waffle + Ice Cream Combo",
    discount_text:  "25% OFF",
    description:    "The perfect dessert pair at a sweet price",
    img_url:        "https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=400&h=200&fit=crop",
    theme: 4,
  },
  {
    restaurantName: "Mama's Kitchen",
    title:          "Weekday Karahi Special",
    discount_text:  "20% OFF",
    description:    "Monday – Friday on dine-in & delivery orders",
    img_url:        "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?q=80&w=400&h=200&fit=crop",
    theme: 5,
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
(async () => {
  console.log("\n🚀  Foodify Image-Ready Seed Starting...\n");
  try {
    // ── Step 0: Ensure image_url columns exist ───────────────────────────────
    console.log("📋  Step 0: Ensuring 'image_url' columns...");
    await addImageUrlColumnSafe("restaurants");
    await addImageUrlColumnSafe("menu_items");

    // ── Step 1: Create deals table ──────────────────────────────────────────
    console.log("\n📋  Step 1: Creating deals table...");
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
    log("deals table ready.");

    // ── Step 2: Insert new category restaurants ─────────────────────────────
    console.log("\n📋  Step 2: Inserting new category restaurants...");
    const HASHED_PW = await bcrypt.hash("demo1234", 10);

    for (const r of NEW_RESTAURANTS) {
      const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [r.email]);
      
      if (existing.length) {
        // Force update category and image_url to fix naming/spacing and broken links
        await pool.query("UPDATE restaurants SET category = ?, image_url = ? WHERE name = ?", [r.category.trim(), r.image_url, r.name]);
        continue;
      }

      const [userRes] = await pool.query(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'restaurant')",
        [r.ownerName, r.email, HASHED_PW]
      );
      const [restRes] = await pool.query(
        "INSERT INTO restaurants (user_id, name, description, category, brand, is_home_chef, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [userRes.insertId, r.name, r.desc, r.category, r.brand, r.is_home_chef ? 1 : 0, r.image_url]
      );
      log(`Inserted: ${r.name} (id=${restRes.insertId})`);
    }

    // Fix for initial seed restaurants (Spice Hub, Burger Point, etc.)
    const INITIAL_FIXES = [
      { name: "Spice Hub", img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600" },
      { name: "Burger Point", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=500" },
      { name: "Pasta House", img: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?q=80&w=500" },
      { name: "fatima's Restaurant", img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=500" },
      { name: "Mama's Kitchen", img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=500" },
      { name: "KFC Corner", img: "https://images.unsplash.com/photo-1562967914-608f82629710?q=80&w=500" },
      { name: "McBurger Shack", img: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=500" },
      { name: "Pizza Palace", img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=500" },
      { name: "Dragon Palace", img: "https://images.unsplash.com/photo-1525755662778-989d0524087e?q=80&w=500" },
      { name: "Sub Station", img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=500" },
      { name: "Domino Pies", img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=500" },
      { name: "Chef Asad's BBQ", img: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=500" },
      { name: "Sweet Corner", img: "https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=500" },
      { name: "Green Bowl", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=500" },
    ];
    for(const f of INITIAL_FIXES) {
      // Force update everything for Spice Hub, or only if empty for others
      if (f.name === "Spice Hub") {
         await pool.query("UPDATE restaurants SET image_url = ? WHERE name = ?", [f.img, f.name]);
      } else {
         await pool.query("UPDATE restaurants SET image_url = ? WHERE name = ? AND (image_url IS NULL OR image_url = '')", [f.img, f.name]);
      }
    }

    // ── Step 3: Seed menu items for all restaurants ─────────────────────────
    console.log("\n📋  Step 3: Seeding menu items with images...");
    const [allRests] = await pool.query("SELECT id, name FROM restaurants");
    for (const rest of allRests) {
      const items = MENU[rest.name];
      if (!items) continue;
      for (const item of items) {
        const [ex] = await pool.query(
          "SELECT id FROM menu_items WHERE restaurant_id = ? AND name = ?",
          [rest.id, item.name]
        );
        if (ex.length) {
           await pool.query(
             "UPDATE menu_items SET image_url = ?, price = ?, description = ? WHERE id = ?",
             [item.image_url, item.price, item.description, ex[0].id]
           );
           continue;
        }
        await pool.query(
          "INSERT INTO menu_items (restaurant_id, name, price, description, image_url) VALUES (?, ?, ?, ?, ?)",
          [rest.id, item.name, item.price, item.description, item.image_url]
        );
      }
      log(`Menu items seeded for: ${rest.name}`);
    }

    // ── Step 4: Seed deals ──────────────────────────────────────────────────
    console.log("\n📋  Step 4: Seeding deals...");
    const [existingDeals] = await pool.query("SELECT COUNT(*) AS cnt FROM deals");
    if (existingDeals[0].cnt > 100) { // arbitrary, just in case
       // skipped
    } else {
      for (const deal of DEAL_SEEDS) {
        const [rests] = await pool.query("SELECT id FROM restaurants WHERE name = ? LIMIT 1", [deal.restaurantName]);
        if (!rests.length) continue;
        
        // check if deal exists
        const [exDeal] = await pool.query("SELECT id FROM deals WHERE restaurant_id = ? AND title = ?", [rests[0].id, deal.title]);
        if (exDeal.length) continue;

        const pctMatch = String(deal.discount_text || "").match(/(\d+)/);
        const discountPct = pctMatch ? Math.min(100, parseInt(pctMatch[1], 10)) : 10;
        await pool.query(
          "INSERT INTO deals (restaurant_id, title, description, discount, image_url) VALUES (?, ?, ?, ?, ?)",
          [rests[0].id, deal.title, deal.description, discountPct, deal.img_url]
        );
        log(`Deal seeded: "${deal.title}"`);
      }
    }

    // ── Summary ─────────────────────────────────────────────────────────────
    const [[{rCnt}]] = await pool.query("SELECT COUNT(*) AS rCnt FROM restaurants");
    const [[{mCnt}]] = await pool.query("SELECT COUNT(*) AS mCnt FROM menu_items");
    const [[{dCnt}]] = await pool.query("SELECT COUNT(*) AS dCnt FROM deals");
    console.log("\n🎉  Extended seed complete!");
    console.log(`   • Restaurants : ${rCnt}`);
    console.log(`   • Menu Items  : ${mCnt}`);
    console.log(`   • Deals       : ${dCnt}\n`);

  } catch (err) {
    console.error("\n❌  Seed failed:", err.message);
    console.error(err);
  } finally {
    process.exit(0);
  }
})();
