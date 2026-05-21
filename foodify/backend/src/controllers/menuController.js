const pool = require("../config/db");

const getMenuByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const [items] = await pool.query(
      "SELECT id, restaurant_id, name, price, description, image_url, category FROM menu_items WHERE restaurant_id = ? ORDER BY id DESC",
      [restaurantId]
    );
    return res.json(items);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch menu", error: error.message });
  }
};

const addMenuItem = async (req, res) => {
  try {
    const { name, price, description, image_url, category } = req.body;
    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required" });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const finalImageUrl = req.file ? `${baseUrl}/uploads/${req.file.filename}` : (image_url || null);

    const [restaurants] = await pool.query("SELECT id FROM restaurants WHERE user_id = ?", [req.user.id]);
    if (!restaurants.length) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const restaurantId = restaurants[0].id;
    await pool.query(
      "INSERT INTO menu_items (restaurant_id, name, price, description, image_url, category) VALUES (?, ?, ?, ?, ?, ?)",
      [restaurantId, name, price, description || "", finalImageUrl, category || "Mains"]
    );

    return res.status(201).json({ message: "Menu item added" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to add menu item", error: error.message });
  }
};

const updateMenuItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { name, price, description, image_url, category } = req.body;
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    
    // If a new file is uploaded, use it. Otherwise, look at image_url. 
    // If no new image AND no image_url provided, it falls back to whatever we decide (null handling).
    const finalImageUrl = req.file ? `${baseUrl}/uploads/${req.file.filename}` : (image_url || null);

    const [restaurants] = await pool.query("SELECT id FROM restaurants WHERE user_id = ?", [req.user.id]);
    if (!restaurants.length) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const restaurantId = restaurants[0].id;
    const [result] = await pool.query(
      "UPDATE menu_items SET name = ?, price = ?, description = ?, image_url = COALESCE(?, image_url), category = ? WHERE id = ? AND restaurant_id = ?",
      [name, price, description || "", finalImageUrl, category || "Mains", itemId, restaurantId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    return res.json({ message: "Menu item updated" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update menu item", error: error.message });
  }
};

const deleteMenuItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const [restaurants] = await pool.query("SELECT id FROM restaurants WHERE user_id = ?", [req.user.id]);
    if (!restaurants.length) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const restaurantId = restaurants[0].id;
    const [result] = await pool.query("DELETE FROM menu_items WHERE id = ? AND restaurant_id = ?", [
      itemId,
      restaurantId,
    ]);

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    return res.json({ message: "Menu item deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete menu item", error: error.message });
  }
};

module.exports = { getMenuByRestaurant, addMenuItem, updateMenuItem, deleteMenuItem };
