require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const bcrypt = require("bcryptjs");
const pool   = require("../config/db");

// ─── Helpers ────────────────────────────────────────────────────────────────
const log  = (msg) => console.log("  ✅", msg);
const warn = (msg) => console.log("  ⚠️ ", msg);

async function columnExists(table, column) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS cnt FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column]
  );
  return rows[0].cnt > 0;
}

async function addColumnSafe(table, column, def) {
  if (await columnExists(table, column)) {
    warn(`Column '${column}' already exists – skipping.`);
  } else {
    await pool.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${def}`);
    log(`Added column '${column}' to '${table}'.`);
  }
}

// ─── Demo restaurant definitions ─────────────────────────────────────────────
const DEMO_RESTAURANTS = [
  { email: "kfccorner@foodify.demo",   ownerName: "KFC Corner Owner",    name: "KFC Corner",       desc: "Crispy fried chicken, zinger burgers & wings",      category: "Fast Food",  brand: "KFC",      is_home_chef: false, image_url: "https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?q=80&w=800&fit=crop" },
  { email: "mcburger@foodify.demo",    ownerName: "McBurger Owner",      name: "McBurger Shack",   desc: "Juicy smash burgers, nuggets & thick shakes",        category: "Burgers",    brand: "McDonalds",is_home_chef: false, image_url: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=800&fit=crop" },
  { email: "pizzapalace@foodify.demo", ownerName: "Pizza Palace Owner",  name: "Pizza Palace",     desc: "Classic & stuffed-crust pizzas baked fresh",         category: "Pizza",      brand: "Pizza Hut", is_home_chef: false, image_url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=800&fit=crop" },
  { email: "dragonpala@foodify.demo",  ownerName: "Dragon Palace Owner", name: "Dragon Palace",    desc: "Authentic Chinese dim sum, noodles & stir-fry",      category: "Chinese",    brand: null,        is_home_chef: false, image_url: "https://images.unsplash.com/photo-1525755662778-989d0524087e?q=80&w=800&fit=crop" },
  { email: "substation@foodify.demo",  ownerName: "Sub Station Owner",   name: "Sub Station",      desc: "Fresh footlong subs & wraps made-to-order",          category: "Fast Food",  brand: "Subway",    is_home_chef: false, image_url: "https://images.unsplash.com/photo-1509722747041-616f39b57569?q=80&w=800&fit=crop" },
  { email: "dominopies@foodify.demo",  ownerName: "Domino Pies Owner",   name: "Domino Pies",      desc: "Hot & cheesy pizzas delivered in 30 minutes",        category: "Pizza",      brand: "Dominos",   is_home_chef: false, image_url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800&fit=crop" },
  { email: "mamaskitch@foodify.demo",  ownerName: "Mama's Kitchen",      name: "Mama's Kitchen",   desc: "Desi home-cooked biryani, karahi & curries",         category: "Biryani",  brand: null,        is_home_chef: true,  image_url: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?q=80&w=800&fit=crop" },
  { email: "chefasad@foodify.demo",    ownerName: "Chef Asad",           name: "Chef Asad's BBQ",  desc: "Charcoal-grilled kababs & authentic street food",     category: "Pakistani",  brand: null,        is_home_chef: true,  image_url: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?q=80&w=800&fit=crop" },
  { email: "sweetcorn@foodify.demo",   ownerName: "Sweet Corner Owner",  name: "Sweet Corner",     desc: "Belgian waffles, ice cream sundaes & milkshakes",    category: "Desserts",   brand: "Starbucks", is_home_chef: false, image_url: "https://images.unsplash.com/photo-1551024506-0cb4a1cb4896?q=80&w=800&fit=crop" },
  { email: "greenbowl@foodify.demo",   ownerName: "Green Bowl",          name: "Green Bowl",       desc: "Clean eating: salads, bowls, wraps & smoothies",     category: "Healthy",    brand: null,        is_home_chef: true,  image_url: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=800&fit=crop" },
];

const EXISTING_UPDATES = [
  { name: "Spice Hub",              category: "Pakistani",  brand: null,           is_home_chef: false, image_url: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=800&fit=crop" },
  { name: "Burger Point",           category: "Burgers",    brand: "McDonalds",    is_home_chef: false, image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&fit=crop" },
  { name: "Pasta House",            category: "Pasta",      brand: null,           is_home_chef: false, image_url: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=800&fit=crop" },
  { name: "fatima's Restaurant",    category: "Pakistani",  brand: null,           is_home_chef: true,  image_url: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=800&fit=crop" },
];

// ─── Menu items — prices in PKR (major-city delivery ballpark) ────────────────
const MENU = {
  "Spice Hub": [
    { name: "Chicken Biryani",    price: 749.99, description: "Aromatic basmati rice with tender spiced chicken", image_url: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=800&fit=crop" },
    { name: "Dal Makhani",        price: 449.99, description: "Slow-cooked creamy black lentil curry", image_url: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=800&fit=crop" },
    { name: "Garlic Naan",        price: 149.99, description: "Freshly baked naan with garlic herb butter", image_url: "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?q=80&w=800&fit=crop" },
    { name: "Mango Lassi",        price: 229.99, description: "Sweet yogurt-based chilled mango drink", image_url: "https://images.unsplash.com/photo-1562235941-697525f6faea?q=80&w=800&fit=crop" },
    { name: "Paneer Tikka",       price: 599.99, description: "Grilled cottage cheese in smoky spiced marinade", image_url: "https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?q=80&w=800&fit=crop" },
  ],
  "Burger Point": [
    { name: "Classic Beef Burger",    price: 699.99, description: "Juicy beef patty, lettuce, tomato & cheddar", image_url: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?q=80&w=800&fit=crop" },
    { name: "Crispy Chicken Burger",  price: 599.99, description: "Fried chicken fillet with ranch sauce", image_url: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?q=80&w=800&fit=crop" },
    { name: "Loaded Fries",           price: 449.99, description: "Fries with cheese sauce & pickled jalapeños", image_url: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?q=80&w=800&fit=crop" },
    { name: "Chocolate Milkshake",    price: 399.99, description: "Thick & creamy hand-blended chocolate shake", image_url: "https://images.unsplash.com/photo-1556881286-fc6915169721?q=80&w=800&fit=crop" },
    { name: "Double Smash Burger",    price: 899.99, description: "Two smashed beef patties with secret sauce", image_url: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?q=80&w=800&fit=crop" },
  ],
  "Pasta House": [
    { name: "Spaghetti Bolognese",  price: 899.99, description: "Slow-cooked meat ragu on fresh spaghetti", image_url: "https://images.unsplash.com/photo-1598866594230-a701ae411440?q=80&w=800&fit=crop" },
    { name: "Penne Arrabiata",      price: 749.99, description: "Spicy tomato penne with chilli & garlic", image_url: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?q=80&w=800&fit=crop" },
    { name: "Fettuccine Alfredo",   price: 949.99, description: "Silky parmesan cream sauce pasta", image_url: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?q=80&w=800&fit=crop" },
    { name: "Garlic Ciabatta",      price: 249.99, description: "Toasted ciabatta with herb & garlic butter", image_url: "https://images.unsplash.com/photo-1618774026330-8d5f35d2fdcc?q=80&w=800&fit=crop" },
    { name: "Tiramisu",             price: 549.99, description: "Classic Italian espresso & mascarpone dessert", image_url: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=800&fit=crop" },
  ],
  "fatima's Restaurant": [
    { name: "Chicken Karahi",    price: 899.99, description: "Home-style spicy wok-cooked chicken", image_url: "https://images.unsplash.com/photo-1565557613262-b8bbba45aa0f?q=80&w=800&fit=crop" },
    { name: "Seekh Kabab",       price: 799.99, description: "Minced beef kababs grilled over open flame", image_url: "https://images.unsplash.com/photo-1599487405445-5df18bc25de9?q=80&w=800&fit=crop" },
    { name: "Mix Daal",          price: 449.99, description: "Mixed lentils tempered with cumin & garlic", image_url: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=800&fit=crop" },
    { name: "Chapati (5 pcs)",   price: 199.99, description: "Fresh hand-rolled whole-wheat flatbreads", image_url: "https://images.unsplash.com/photo-1509440153956-024acc443d9e?q=80&w=800&fit=crop" },
    { name: "Gulab Jamun (4)",   price: 399.99, description: "Soft milk dumplings in rose-scented syrup", image_url: "https://images.unsplash.com/photo-1597509633652-320d757db604?q=80&w=800&fit=crop" },
  ],
  "KFC Corner": [
    { name: "Zinger Burger",        price: 649.99, description: "Spicy crispy chicken fillet burger", image_url: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?q=80&w=800&fit=crop" },
    { name: "Original Bucket (8)", price: 2299.99, description: "8 pcs original recipe fried chicken", image_url: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=800&fit=crop" },
    { name: "Hot Wings (6 pcs)",    price: 549.99, description: "Spicy flash-fried chicken wings", image_url: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?q=80&w=800&fit=crop" },
    { name: "Coleslaw",             price: 199.99, description: "Creamy classic coleslaw side", image_url: "https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?q=80&w=800&fit=crop" },
    { name: "Zinger Box Meal",      price: 1099.99, description: "Zinger + fries + drink combo box", image_url: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=800&fit=crop" },
  ],
  "McBurger Shack": [
    { name: "Big Stack Burger",  price: 799.99, description: "Double patty with special sauce & pickles", image_url: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=800&fit=crop" },
    { name: "McChicken",         price: 549.99, description: "Crispy chicken burger with creamy mayo", image_url: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=800&fit=crop" },
    { name: "Nuggets (10 pcs)", price: 499.99, description: "Golden crispy chicken nuggets", image_url: "https://images.unsplash.com/photo-1562967914-608f82629710?q=80&w=800&fit=crop" },
    { name: "Large Fries",       price: 349.99, description: "Classic golden French fries – large", image_url: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?q=80&w=800&fit=crop" },
    { name: "Soft Serve Flurry", price: 299.99, description: "Creamy soft-serve ice cream cup", image_url: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?q=80&w=800&fit=crop" },
  ],
  "Pizza Palace": [
    { name: "Pepperoni Pizza (M)",    price: 1699.99, description: "Classic pepperoni on rich tomato base", image_url: "https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=800&fit=crop" },
    { name: "BBQ Chicken Pizza (M)",  price: 1799.99, description: "Smoky BBQ sauce with grilled chicken", image_url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800&fit=crop" },
    { name: "Margherita (M)",         price: 1499.99, description: "Fresh mozzarella, tomato & basil", image_url: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=800&fit=crop" },
    { name: "Stuffed Crust Veggie",   price: 1749.99, description: "Cheese-stuffed crust with garden veggies", image_url: "https://images.unsplash.com/photo-1604381536136-24eb14736fdf?q=80&w=800&fit=crop" },
    { name: "Garlic Dip Sticks",      price: 449.99, description: "Cheesy breadsticks with garlic dip", image_url: "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?q=80&w=800&fit=crop" },
  ],
  "Dragon Palace": [
    { name: "Steamed Dim Sum (8)",   price: 799.99, description: "Assorted pork & prawn dumplings", image_url: "https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=800&fit=crop" },
    { name: "Kung Pao Chicken",      price: 1049.99, description: "Spicy stir-fry with peanuts & peppers", image_url: "https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=800&fit=crop" },
    { name: "Egg Fried Rice",        price: 649.99, description: "Wok-tossed rice with egg & vegetables", image_url: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?q=80&w=800&fit=crop" },
    { name: "Chow Mein Noodles",     price: 699.99, description: "Stir-fried egg noodles with veggies", image_url: "https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=800&fit=crop" },
    { name: "Crispy Spring Rolls (4)", price: 449.99, description: "Deep-fried vegetable spring rolls", image_url: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&fit=crop" },
  ],
  "Sub Station": [
    { name: "Classic BMT Footlong",    price: 899.99, description: "Pepperoni, salami & ham on Italian bread", image_url: "https://images.unsplash.com/photo-1509722747041-616f39b57569?q=80&w=800&fit=crop" },
    { name: "Chicken Teriyaki Sub",    price: 849.99, description: "Teriyaki-glazed chicken with fresh veggies", image_url: "https://images.unsplash.com/photo-1528736235302-52922df5c122?q=80&w=800&fit=crop" },
    { name: "Veggie Delight",          price: 649.99, description: "Fresh garden veggies on herb bread", image_url: "https://images.unsplash.com/photo-1550508139-b96701bb27dc?q=80&w=800&fit=crop" },
    { name: "Tuna Melt 6-inch",        price: 749.99, description: "Tuna salad with melted cheddar", image_url: "https://images.unsplash.com/photo-1509722747041-616f39b57569?q=80&w=800&fit=crop" },
    { name: "Choc Chip Cookies (3)",   price: 249.99, description: "Freshly baked warm chocolate chip cookies", image_url: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=800&fit=crop" },
  ],
  "Domino Pies": [
    { name: "Chicken Dominator (M)",  price: 1899.99, description: "4 premium chicken toppings pizza", image_url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=800&fit=crop" },
    { name: "Peppy Paneer (M)",       price: 1599.99, description: "Spicy cottage cheese & capsicum pizza", image_url: "https://images.unsplash.com/photo-1604381536136-24eb14736fdf?q=80&w=800&fit=crop" },
    { name: "Pasta in Red Sauce",     price: 849.99, description: "Penne in smoky arrabbiata tomato sauce", image_url: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?q=80&w=800&fit=crop" },
    { name: "Stuffed Garlic Bread",   price: 549.99, description: "Cheesy garlic bread with dipping sauce", image_url: "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?q=80&w=800&fit=crop" },
    { name: "Choco Lava Cake",        price: 499.99, description: "Warm chocolate cake with molten centre", image_url: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?q=80&w=800&fit=crop" },
  ],
  "Mama's Kitchen": [
    { name: "Chicken Karahi",     price: 899.99, description: "Rich, spicy home-style chicken karahi", image_url: "https://images.unsplash.com/photo-1565557613262-b8bbba45aa0f?q=80&w=800&fit=crop" },
    { name: "Beef Nihari",        price: 849.99, description: "Slow-cooked bone-in beef stew", image_url: "https://images.unsplash.com/photo-1546833998-877b37c2e5c6?q=80&w=800&fit=crop" },
    { name: "Lahori Chargha",     price: 1099.99, description: "Whole marinated chicken deep fried", image_url: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=800&fit=crop" },
    { name: "Chapati (5 pcs)",    price: 199.99, description: "Fresh hand-rolled whole-wheat flatbreads", image_url: "https://images.unsplash.com/photo-1565557613262-b8bbba45aa0f?q=80&w=800&fit=crop" },
    { name: "Kheer",              price: 399.99, description: "Creamy rice pudding with cardamom & nuts", image_url: "https://images.unsplash.com/photo-1551024506-0cb4a1cb4896?q=80&w=800&fit=crop" },
  ],
  "Chef Asad's BBQ": [
    { name: "Seekh Kabab Plate",  price: 899.99, description: "Charcoal-grilled minced beef kababs", image_url: "https://images.unsplash.com/photo-1599487405445-5df18bc25de9?q=80&w=800&fit=crop" },
    { name: "Chapli Kabab",       price: 849.99, description: "Peshwari-style spiced beef patty kabab", image_url: "https://images.unsplash.com/photo-1603504364026-6215b2efcd4e?q=80&w=800&fit=crop" },
    { name: "Mutton Pulao",       price: 999.99, description: "Fragrant rice cooked in slow-simmered stock", image_url: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=800&fit=crop" },
    { name: "Masala Fries",       price: 399.99, description: "Crispy fries tossed in chaat masala", image_url: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?q=80&w=800&fit=crop" },
    { name: "Raita & Salad",      price: 149.99, description: "Cool yogurt dip with fresh onion salad", image_url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&fit=crop" },
  ],
  "Sweet Corner": [
    { name: "Nutella Waffle",       price: 599.99, description: "Crispy Belgian waffle with Nutella & banana", image_url: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=800&fit=crop" },
    { name: "Triple Scoop Sundae", price: 549.99, description: "3 scoops, hot fudge & crushed nuts", image_url: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?q=80&w=800&fit=crop" },
    { name: "Oreo Milkshake",       price: 549.99, description: "Thick Oreo cream milkshake", image_url: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=800&fit=crop" },
    { name: "Caramel Cheesecake",   price: 749.99, description: "New York style slice with caramel drizzle", image_url: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=800&fit=crop" },
    { name: "Warm Brownie",         price: 449.99, description: "Fudgy chocolate brownie with ice cream", image_url: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?q=80&w=800&fit=crop" },
  ],
  "Green Bowl": [
    { name: "Caesar Salad",         price: 799.99, description: "Romaine, croutons, parmesan & Caesar dressing", image_url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&fit=crop" },
    { name: "Quinoa Power Bowl",    price: 999.99, description: "Quinoa with roasted veggies & tahini dressing", image_url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&fit=crop" },
    { name: "Avo Toast",            price: 699.99, description: "Multigrain toast, smashed avocado & poached egg", image_url: "https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=800&fit=crop" },
    { name: "Berry Smoothie",       price: 449.99, description: "Mixed berry, banana & almond milk smoothie", image_url: "https://images.unsplash.com/photo-1556881286-fc6915169721?q=80&w=800&fit=crop" },
    { name: "Grilled Chicken Wrap", price: 849.99, description: "Lean chicken, greens & hummus in wheat wrap", image_url: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?q=80&w=800&fit=crop" },
  ],
};

// ─── Main ─────────────────────────────────────────────────────────────────────
(async () => {
  console.log("\n🚀  Foodify Seed Script Starting...\n");

  try {
    // ── Step 1: Add new columns safely ───────────────────────────────────────
    console.log("📋  Step 1: Ensuring schema columns...");
    await addColumnSafe("restaurants", "category",     "VARCHAR(50)  DEFAULT 'Fast Food'");
    await addColumnSafe("restaurants", "brand",        "VARCHAR(100) DEFAULT NULL");
    await addColumnSafe("restaurants", "is_home_chef", "TINYINT(1)   DEFAULT 0");
    await addColumnSafe("restaurants", "image_url",    "VARCHAR(255) DEFAULT NULL");
    await addColumnSafe("menu_items",  "image_url",    "VARCHAR(255) DEFAULT NULL");

    // ── Step 2: Update existing restaurants ──────────────────────────────────
    console.log("\n📋  Step 2: Updating existing restaurants...");
    for (const r of EXISTING_UPDATES) {
      const [rows] = await pool.query("SELECT id FROM restaurants WHERE name = ?", [r.name]);
      if (rows.length) {
        await pool.query(
          "UPDATE restaurants SET category = ?, brand = ?, is_home_chef = ?, image_url = ? WHERE name = ?",
          [r.category, r.brand, r.is_home_chef ? 1 : 0, r.image_url, r.name]
        );
        log(`Updated: ${r.name}`);
      } else {
        warn(`Restaurant '${r.name}' not found – skipping update.`);
      }
    }

    // ── Step 3: Insert or Update demo restaurants ──────────────────────────────────
    console.log("\n📋  Step 3: Inserting/Updating demo restaurants...");
    const HASHED_PW = await bcrypt.hash("demo1234", 10);

    for (const r of DEMO_RESTAURANTS) {
      // Check if user already exists
      const [existingUser] = await pool.query("SELECT id FROM users WHERE email = ?", [r.email]);
      let userId;
      
      if (existingUser.length) {
        userId = existingUser[0].id;
      } else {
        const [userResult] = await pool.query(
          "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'restaurant')",
          [r.ownerName, r.email, HASHED_PW]
        );
        userId = userResult.insertId;
      }

      // Check if restaurant already exists
      const [existingRest] = await pool.query("SELECT id FROM restaurants WHERE name = ?", [r.name]);
      if (existingRest.length) {
         await pool.query(
            "UPDATE restaurants SET category = ?, brand = ?, is_home_chef = ?, image_url = ? WHERE id = ?",
            [r.category, r.brand, r.is_home_chef ? 1 : 0, r.image_url, existingRest[0].id]
         );
         log(`Updated demo restaurant: ${r.name}`);
      } else {
         const [restResult] = await pool.query(
            "INSERT INTO restaurants (user_id, name, description, category, brand, is_home_chef, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [userId, r.name, r.desc, r.category, r.brand, r.is_home_chef ? 1 : 0, r.image_url]
         );
         log(`Inserted demo restaurant: ${r.name} (id=${restResult.insertId})`);
      }
    }

    // ── Step 4: Insert or Update menu items for all restaurants ─────────────────────────
    console.log("\n📋  Step 4: Seeding/Updating menu items...");
    const [allRestaurants] = await pool.query("SELECT id, name FROM restaurants");

    for (const rest of allRestaurants) {
      const items = MENU[rest.name];
      if (!items || items.length === 0) {
        warn(`No menu items defined for '${rest.name}' – skipping.`);
        continue;
      }

      for (const item of items) {
        // Check if item already exists for this restaurant
        const [existing] = await pool.query(
          "SELECT id FROM menu_items WHERE restaurant_id = ? AND name = ?",
          [rest.id, item.name]
        );
        if (existing.length) {
          await pool.query(
             "UPDATE menu_items SET price = ?, description = ?, image_url = ? WHERE id = ?",
             [item.price, item.description, item.image_url, existing[0].id]
          );
        } else {
          await pool.query(
             "INSERT INTO menu_items (restaurant_id, name, price, description, image_url) VALUES (?, ?, ?, ?, ?)",
             [rest.id, item.name, item.price, item.description, item.image_url]
          );
        }
      }
      log(`Menu items seeded for: ${rest.name}`);
    }

    // ── Summary ───────────────────────────────────────────────────────────────
    const [finalRests]  = await pool.query("SELECT COUNT(*) AS cnt FROM restaurants");
    const [finalMenus]  = await pool.query("SELECT COUNT(*) AS cnt FROM menu_items");

    console.log("\n🎉  Seed complete!");
    console.log(`   • Restaurants  : ${finalRests[0].cnt}`);
    console.log(`   • Menu Items   : ${finalMenus[0].cnt}`);
    console.log("\n   Demo login credentials (restaurant owners): password = demo1234\n");

  } catch (err) {
    console.error("\n❌  Seed failed:", err.message);
    console.error(err);
  } finally {
    process.exit(0);
  }
})();
