const pool = require("../config/db");

const getRestaurants = async (req, res) => {
  try {
    const { category, brand } = req.query;

    let sql = `
      SELECT r.id, r.name, r.description, r.category, r.brand, r.is_home_chef, r.image_url, 
             GROUP_CONCAT(LOWER(m.name)) AS menu_items_concat
      FROM restaurants r
      LEFT JOIN menu_items m ON m.restaurant_id = r.id
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      sql += " AND r.category = ?";
      params.push(category);
    }
    if (brand) {
      sql += " AND r.brand = ?";
      params.push(brand);
    }

    sql += " GROUP BY r.id ORDER BY r.id DESC";

    const [rows] = await pool.query(sql, params);
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch restaurants", error: error.message });
  }
};

const getRestaurantOrders = async (req, res) => {
  try {
    const [restaurants] = await pool.query("SELECT id FROM restaurants WHERE user_id = ?", [req.user.id]);
    if (!restaurants.length) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const restaurantId = restaurants[0].id;
    const [orders] = await pool.query(
      `SELECT o.id, o.total_price, o.status, u.name AS customer_name
       FROM orders o
       JOIN users u ON u.id = o.user_id
       WHERE o.restaurant_id = ?
       ORDER BY o.id DESC`,
      [restaurantId]
    );
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch orders", error: error.message });
  }
};

const getMyRestaurant = async (req, res) => {
  try {
    const [restaurants] = await pool.query(
      "SELECT id, name, description, category, brand, is_home_chef, image_url FROM restaurants WHERE user_id = ?",
      [req.user.id]
    );
    if (!restaurants.length) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    return res.json(restaurants[0]);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch restaurant", error: error.message });
  }
};

const acceptOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const [restaurants] = await pool.query("SELECT id FROM restaurants WHERE user_id = ?", [req.user.id]);
    if (!restaurants.length) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const restaurantId = restaurants[0].id;
    const [result] = await pool.query(
      "UPDATE orders SET status = 'accepted' WHERE id = ? AND restaurant_id = ?",
      [orderId, restaurantId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json({ message: "Order accepted" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to accept order", error: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    // Validate status
    if (!["accepted", "preparing", "ready", "completed", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status update" });
    }

    const [restaurants] = await pool.query("SELECT id FROM restaurants WHERE user_id = ?", [req.user.id]);
    if (!restaurants.length) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const restaurantId = restaurants[0].id;
    const [result] = await pool.query(
      "UPDATE orders SET status = ? WHERE id = ? AND restaurant_id = ?",
      [status, orderId, restaurantId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json({ message: `Order status updated to ${status}` });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update order status", error: error.message });
  }
};

module.exports = { getRestaurants, getRestaurantOrders, acceptOrder, getMyRestaurant, updateOrderStatus };
