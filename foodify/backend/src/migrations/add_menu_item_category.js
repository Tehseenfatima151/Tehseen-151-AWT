const pool = require("../config/db");

(async () => {
  console.log("\n🚀 Running menu items category migration...");
  try {
    // Add column if not exists
    try {
      await pool.query("ALTER TABLE menu_items ADD COLUMN category VARCHAR(100) DEFAULT 'Mains'");
      console.log("✅ Added column 'category' to 'menu_items' table.");
    } catch (err) {
      if (err.code === "ER_DUP_FIELDNAME" || err.message.includes("Duplicate column name")) {
        console.log("ℹ️ Column 'category' already exists in 'menu_items' table.");
      } else {
        throw err;
      }
    }

    // Seed categories for existing items
    const categoryMap = {
      // Biryani House
      "Chicken Biryani Special": "Biryani",
      "Mutton Biryani": "Biryani",
      "Prawn Biryani": "Biryani",
      "Vegetable Biryani": "Biryani",
      "Biryani Half Portion": "Biryani",
      // Burger Bros
      "Classic Smash Burger": "Burgers",
      "BBQ Bacon Burger": "Burgers",
      "Mushroom Swiss": "Burgers",
      "Veggie Bean Burger": "Burgers",
      "Double Trouble Burger": "Burgers",
      // Desi Breakfast Corner
      "Halwa Puri Set": "Breakfast Sets",
      "Channay Wala Puri": "Breakfast Sets",
      "Paye Nihari": "Breakfast Sets",
      "Aloo Bhujia Side": "Breakfast Sets",
      "Lassi (Sweet)": "Beverages",
      // Paratha Junction
      "Aloo Paratha": "Parathas",
      "Keema Paratha": "Parathas",
      "Chicken Paratha Roll": "Rolls",
      "Anday Wala Paratha": "Parathas",
      "Makai Paratha": "Parathas",
      // Chill Zone
      "Mango Sundae": "Sundaes",
      "Strawberry Shake": "Shakes",
      "Double Scoop Gelato": "Gelato",
      "Ice Cream Sandwich": "Desserts",
      "Banana Split": "Sundaes",
      // Pasta Primo
      "Spaghetti Carbonara": "Pasta",
      "Lasagne al Forno": "Pasta",
      "Mushroom Fettuccine": "Pasta",
      "Bruschetta (4 pcs)": "Starters",
      "Panna Cotta": "Desserts",
      // Pulao Palace
      "Chicken Pulao": "Pulao",
      "Mutton Pulao Special": "Pulao",
      "Kabuli Pulao": "Pulao",
      "Vegetable Pulao": "Pulao",
      "Pulao + Raita Combo": "Pulao",
      // Shawarma Star
      "Chicken Shawarma Wrap": "Wraps",
      "Beef Shawarma Wrap": "Wraps",
      "Shawarma Platter": "Platters",
      "Shawarma Loaded Fries": "Sides",
      "Double Shawarma Wrap": "Wraps",
      // Haleem Hub
      "Chicken Haleem": "Haleem",
      "Beef Haleem": "Haleem",
      "Haleem Sandwich": "Sandwiches",
      "Khichri": "Rice Dishes",
      "Nihari + Haleem Combo": "Combos",
      // Bake & Cake Shop
      "Red Velvet Slice": "Cake Slices",
      "Chocolate Truffle Cake": "Whole Cakes",
      "Blueberry Cheesecake": "Cake Slices",
      "Almond Croissant": "Pastries",
      "Macarons (6 pcs)": "Pastries",
      // Juice Bar & Drinks
      "Watermelon Blast": "Fresh Juices",
      "Mango Frenzy": "Fresh Juices",
      "Green Detox": "Healthy Blends",
      "Sparkling Lemonade": "Mocktails",
      "Avocado Banana Shake": "Shakes",
      // Spice Hub
      "Mango Lassi": "Beverages",
      "Garlic Naan": "Breads",
      "Dal Makhani": "Desi Specialties",
      "Masala Dosa": "Desi Specialties",
      "Butter Chicken": "Desi Specialties",
      "Paneer Tikka": "Starters",
    };

    console.log("Seeding categories for existing menu items...");
    for (const [name, category] of Object.entries(categoryMap)) {
      await pool.query(
        "UPDATE menu_items SET category = ? WHERE name = ?",
        [category, name]
      );
    }

    // Default remaining ones to 'Mains' if they are null
    await pool.query(
      "UPDATE menu_items SET category = 'Mains' WHERE category IS NULL OR category = ''"
    );

    console.log("✅ Database migration complete!");
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
  } finally {
    process.exit(0);
  }
})();
