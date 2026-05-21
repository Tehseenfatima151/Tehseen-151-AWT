const pool = require("../config/db");

/**
 * GET /api/search?q=keyword
 * Returns matching restaurants (by name) and menu items (by name).
 */
const search = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json({ restaurants: [], menuItems: [] });
    }
    const term = `%${q.trim()}%`;

    const [restaurants] = await pool.query(
      `SELECT id, name, description, category, brand, image_url
       FROM restaurants
       WHERE name LIKE ? 
          OR category LIKE ? 
          OR CONCAT(category, 's') LIKE ?
       ORDER BY id DESC
       LIMIT 8`,
      [term, term, term]
    );

    const [menuItems] = await pool.query(
      `SELECT m.id, m.name, m.price, m.description, m.image_url,
              r.id   AS restaurant_id,
              r.name AS restaurant_name,
              r.category
       FROM menu_items m
       JOIN restaurants r ON r.id = m.restaurant_id
       WHERE m.name LIKE ? OR CONCAT(m.name, 's') LIKE ?
       ORDER BY m.id DESC
       LIMIT 8`,
      [term, term]
    );

    return res.json({ restaurants, menuItems });
  } catch (error) {
    return res.status(500).json({ message: "Search failed", error: error.message });
  }
};

module.exports = { search };
