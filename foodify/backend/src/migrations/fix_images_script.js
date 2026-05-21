const pool = require("../config/db");

const IMAGE_MAP = {
  burger: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600",
  pizza: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600",
  biryani: "https://upload.wikimedia.org/wikipedia/commons/2/23/Biryani_of_Lahore.jpg",
  pulao: "https://upload.wikimedia.org/wikipedia/commons/2/23/Biryani_of_Lahore.jpg",
  paratha: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Aloo_Paratha_also_known_as_Batatay_Jo_Phulko.jpg/800px-Aloo_Paratha_also_known_as_Batatay_Jo_Phulko.jpg",
  samosa: "https://upload.wikimedia.org/wikipedia/commons/c/c8/Samosa_dish.jpg",
  haleem: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Haleem%21.jpg",
  nihari: "https://upload.wikimedia.org/wikipedia/commons/1/15/Nihari_Dish.jpg",
  shawarma: "https://images.unsplash.com/photo-1626804475297-4160aeacaf8b?w=600",
  pasta: "https://images.unsplash.com/photo-1598866594230-a701ae411440?w=600",
  chinese: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600",
  rice: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600",
  bbq: "https://upload.wikimedia.org/wikipedia/commons/b/b5/Seekh_Kabab_at_food_street_in_Lahore.jpg",
  kabab: "https://upload.wikimedia.org/wikipedia/commons/b/b5/Seekh_Kabab_at_food_street_in_Lahore.jpg",
  drink: "https://images.unsplash.com/photo-1572490122747-3968b75bb827?w=600",
  shake: "https://images.unsplash.com/photo-1572490122747-3968b75bb827?w=600",
  cake: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600",
  dessert: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600",
  puri: "https://upload.wikimedia.org/wikipedia/commons/b/bc/Halwa_Puri_Channay.jpg",
  general: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600",
  sub: "https://images.unsplash.com/photo-1509722747041-616f39b57569?q=80&w=300",
  fries: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/French_Fries.jpg/800px-French_Fries.jpg",
  chicken: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600",
  salad: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600",
  coffee: "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=600"
};

function getUrl(name) {
  const n = name.toLowerCase();
  for (const [key, val] of Object.entries(IMAGE_MAP)) {
    if (n.includes(key)) return val;
  }
  return IMAGE_MAP.general;
}

(async () => {
    console.log("Fixing menu_items images...");
    const [menus] = await pool.query("SELECT id, name FROM menu_items");
    for (const m of menus) {
       await pool.query("UPDATE menu_items SET image_url = ? WHERE id = ?", [getUrl(m.name), m.id]);
    }

    console.log("Fixing restaurants images...");
    const [rests] = await pool.query("SELECT id, name, category FROM restaurants");
    for (const r of rests) {
       // Combine name and category to help matching
       await pool.query("UPDATE restaurants SET image_url = ? WHERE id = ?", [getUrl(r.name + ' ' + r.category), r.id]);
    }

    console.log("Done fixing images!");
    process.exit(0);
})();
