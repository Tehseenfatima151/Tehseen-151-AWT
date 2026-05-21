const pool = require("../config/db");

/**
 * POST /api/favorites/toggle
 * Body: { restaurant_id }
 * Toggles a restaurant in the logged-in user's favorites.
 * Returns { favorited: true/false }
 */
const toggleFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { restaurant_id } = req.body;

    if (!restaurant_id) {
      return res.status(400).json({ message: "restaurant_id is required" });
    }

    // Check if it already exists
    const [existing] = await pool.query(
      "SELECT id FROM favorites WHERE user_id = ? AND restaurant_id = ?",
      [userId, restaurant_id]
    );

    if (existing.length > 0) {
      // Remove from favorites
      await pool.query(
        "DELETE FROM favorites WHERE user_id = ? AND restaurant_id = ?",
        [userId, restaurant_id]
      );
      return res.json({ favorited: false, message: "Removed from favorites" });
    } else {
      // Add to favorites
      await pool.query(
        "INSERT INTO favorites (user_id, restaurant_id) VALUES (?, ?)",
        [userId, restaurant_id]
      );
      return res.json({ favorited: true, message: "Added to favorites" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Failed to toggle favorite", error: error.message });
  }
};

/**
 * GET /api/favorites
 * Returns all favorited restaurants for the logged-in user.
 */
const getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `SELECT r.id, r.name, r.description, r.image_url, r.category, r.brand, r.is_home_chef
       FROM favorites f
       JOIN restaurants r ON r.id = f.restaurant_id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC`,
      [userId]
    );

    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch favorites", error: error.message });
  }
};

/**
 * GET /api/favorites/ids
 * Returns just the restaurant_ids favorited by the user (for quick lookup on home page).
 */
const getFavoriteIds = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      "SELECT restaurant_id FROM favorites WHERE user_id = ?",
      [userId]
    );
    return res.json(rows.map((r) => r.restaurant_id));
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch favorite IDs", error: error.message });
  }
};

module.exports = { toggleFavorite, getFavorites, getFavoriteIds };
