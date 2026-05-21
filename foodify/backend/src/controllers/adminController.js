/**
 * Admin Controller — all admin-only operations
 * Requires auth + authorize("admin") middleware on every route
 */

const pool = require("../config/db");

// ─── DASHBOARD STATS ────────────────────────────────────────────────────────

const getDashboardStats = async (_req, res) => {
  try {
    const [[{ totalCustomers }]] = await pool.query(
      `SELECT COUNT(*) AS totalCustomers FROM users WHERE role = 'customer'`
    );
    const [[{ totalRestaurants }]] = await pool.query(
      `SELECT COUNT(*) AS totalRestaurants FROM restaurants`
    );
    const [[{ totalOrders }]] = await pool.query(
      `SELECT COUNT(*) AS totalOrders FROM orders`
    );
    const [[{ activeDeals }]] = await pool.query(
      `SELECT COUNT(*) AS activeDeals FROM deals
       WHERE (valid_until IS NULL OR valid_until >= CURDATE())
         AND (valid_from IS NULL OR valid_from <= CURDATE())`
    );
    const [[{ homeChefs }]] = await pool.query(
      `SELECT COUNT(*) AS homeChefs FROM restaurants WHERE is_home_chef = 1`
    );
    const [[{ topShops }]] = await pool.query(
      `SELECT COUNT(*) AS topShops FROM restaurants WHERE is_top_shop = 1`
    );
    const [[{ totalRevenue }]] = await pool.query(
      `SELECT COALESCE(SUM(total_price), 0) AS totalRevenue FROM orders WHERE status NOT IN ('rejected')`
    );
    const [[{ pendingOrders }]] = await pool.query(
      `SELECT COUNT(*) AS pendingOrders FROM orders WHERE status = 'pending'`
    );

    // Recent orders
    const [recentOrders] = await pool.query(
      `SELECT o.id, o.total_price, o.status, o.created_at, o.payment_method,
              u.name AS customer_name, r.name AS restaurant_name
       FROM orders o
       JOIN users u ON u.id = o.user_id
       JOIN restaurants r ON r.id = o.restaurant_id
       ORDER BY o.created_at DESC LIMIT 10`
    );

    // Recent restaurants (restaurants has no created_at, use users.created_at)
    const [recentRestaurants] = await pool.query(
      `SELECT r.id, r.name, r.category, r.is_active,
              u.created_at, u.name AS owner_name, u.email AS owner_email
       FROM restaurants r
       JOIN users u ON u.id = r.user_id
       ORDER BY r.id DESC LIMIT 8`
    );

    // Orders per day (last 7 days)
    const [ordersPerDay] = await pool.query(
      `SELECT DATE(created_at) AS date, COUNT(*) AS count, COALESCE(SUM(total_price),0) AS revenue
       FROM orders
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       GROUP BY DATE(created_at)
       ORDER BY date ASC`
    );

    // Monthly revenue — last 12 months (include all non-rejected, handle empty status)
    const [monthlyRevenue] = await pool.query(
      `SELECT
         DATE_FORMAT(created_at, '%Y-%m') AS month,
         DATE_FORMAT(created_at, '%b %Y')  AS label,
         COUNT(*)                           AS orders,
         COALESCE(SUM(total_price), 0)      AS revenue
       FROM orders
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
         AND (status IS NULL OR status != 'rejected')
       GROUP BY DATE_FORMAT(created_at, '%Y-%m')
       ORDER BY month ASC`
    );

    // Order status breakdown (include all statuses including empty)
    const [statusBreakdown] = await pool.query(
      `SELECT
         CASE WHEN (status IS NULL OR status = '') THEN 'pending' ELSE status END AS status,
         COUNT(*) AS count
       FROM orders
       GROUP BY CASE WHEN (status IS NULL OR status = '') THEN 'pending' ELSE status END`
    );

    // Top 5 restaurants by revenue (include all non-rejected)
    const [topRestaurants] = await pool.query(
      `SELECT r.name, COUNT(o.id) AS orders, COALESCE(SUM(o.total_price),0) AS revenue
       FROM orders o
       JOIN restaurants r ON r.id = o.restaurant_id
       WHERE (o.status IS NULL OR o.status != 'rejected')
       GROUP BY r.id
       ORDER BY revenue DESC
       LIMIT 5`
    );

    return res.json({
      stats: {
        totalCustomers,
        totalRestaurants,
        totalOrders,
        activeDeals,
        homeChefs,
        topShops,
        totalRevenue: Number(totalRevenue),
        pendingOrders,
      },
      recentOrders,
      recentRestaurants,
      ordersPerDay,
      monthlyRevenue,
      statusBreakdown,
      topRestaurants,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch stats", error: error.message });
  }
};

// ─── RESTAURANT MANAGEMENT ──────────────────────────────────────────────────

const getAllRestaurants = async (req, res) => {
  try {
    const { search, category, status } = req.query;
    let sql = `
      SELECT r.id, r.name, r.description, r.category, r.brand, r.image_url,
             r.is_active, r.is_home_chef, r.is_top_shop, r.is_featured, r.top_shop_order,
             u.created_at,
             u.id AS user_id, u.name AS owner_name, u.email AS owner_email,
             u.is_blocked AS owner_blocked,
             (SELECT COUNT(*) FROM menu_items m WHERE m.restaurant_id = r.id) AS menu_count,
             (SELECT COUNT(*) FROM orders o WHERE o.restaurant_id = r.id) AS order_count
      FROM restaurants r
      JOIN users u ON u.id = r.user_id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += " AND (r.name LIKE ? OR u.email LIKE ? OR u.name LIKE ?)";
      const s = `%${search}%`;
      params.push(s, s, s);
    }
    if (category) {
      sql += " AND r.category = ?";
      params.push(category);
    }
    if (status === "active") {
      sql += " AND r.is_active = 1";
    } else if (status === "inactive") {
      sql += " AND r.is_active = 0";
    }

    sql += " ORDER BY r.id DESC";
    const [rows] = await pool.query(sql, params);
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch restaurants", error: error.message });
  }
};

const createRestaurant = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { name, email, password, ownerName, description, category, brand, phone, address, is_home_chef } = req.body;
    if (!name || !email || !password || !ownerName) {
      return res.status(400).json({ message: "name, email, password, ownerName are required" });
    }

    const [existing] = await conn.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const bcrypt = require("bcryptjs");
    const hashed = await bcrypt.hash(password, 10);

    await conn.beginTransaction();

    const [userResult] = await conn.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'restaurant')",
      [ownerName, email, hashed]
    );

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const imageUrl = req.file ? `${baseUrl}/uploads/${req.file.filename}` : null;

    await conn.query(
      `INSERT INTO restaurants (user_id, name, description, category, brand, image_url, is_home_chef)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userResult.insertId,
        name,
        description || "",
        category || null,
        brand || null,
        imageUrl,
        is_home_chef === "true" || is_home_chef === true ? 1 : 0,
      ]
    );

    await conn.commit();
    return res.status(201).json({ message: "Restaurant created successfully" });
  } catch (error) {
    await conn.rollback();
    return res.status(500).json({ message: "Failed to create restaurant", error: error.message });
  } finally {
    conn.release();
  }
};

const updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, brand, is_active, is_home_chef, is_top_shop, is_featured, top_shop_order, image_url } = req.body;

    const [existing] = await pool.query("SELECT * FROM restaurants WHERE id = ?", [id]);
    if (!existing.length) return res.status(404).json({ message: "Restaurant not found" });

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    let finalImage = existing[0].image_url;
    if (req.file) finalImage = `${baseUrl}/uploads/${req.file.filename}`;
    else if (image_url !== undefined && image_url !== "") finalImage = image_url;

    const ex = existing[0];
    await pool.query(
      `UPDATE restaurants SET
        name = ?, description = ?, category = ?, brand = ?,
        image_url = ?, is_active = ?, is_home_chef = ?,
        is_top_shop = ?, is_featured = ?, top_shop_order = ?
       WHERE id = ?`,
      [
        name ?? ex.name,
        description ?? ex.description,
        category ?? ex.category,
        brand ?? ex.brand,
        finalImage,
        is_active !== undefined ? (is_active === "true" || is_active === true ? 1 : 0) : ex.is_active,
        is_home_chef !== undefined ? (is_home_chef === "true" || is_home_chef === true ? 1 : 0) : ex.is_home_chef,
        is_top_shop !== undefined ? (is_top_shop === "true" || is_top_shop === true ? 1 : 0) : ex.is_top_shop,
        is_featured !== undefined ? (is_featured === "true" || is_featured === true ? 1 : 0) : ex.is_featured,
        top_shop_order !== undefined ? Number(top_shop_order) : ex.top_shop_order,
        id,
      ]
    );

    return res.json({ message: "Restaurant updated" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update restaurant", error: error.message });
  }
};

const deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    // Get user_id first so we can delete the user (cascades restaurant)
    const [rows] = await pool.query("SELECT user_id FROM restaurants WHERE id = ?", [id]);
    if (!rows.length) return res.status(404).json({ message: "Restaurant not found" });

    await pool.query("DELETE FROM users WHERE id = ?", [rows[0].user_id]);
    return res.json({ message: "Restaurant deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete restaurant", error: error.message });
  }
};

const toggleRestaurantStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT is_active FROM restaurants WHERE id = ?", [id]);
    if (!rows.length) return res.status(404).json({ message: "Restaurant not found" });

    const newStatus = rows[0].is_active ? 0 : 1;
    await pool.query("UPDATE restaurants SET is_active = ? WHERE id = ?", [newStatus, id]);
    return res.json({ message: `Restaurant ${newStatus ? "activated" : "deactivated"}`, is_active: newStatus });
  } catch (error) {
    return res.status(500).json({ message: "Failed to toggle status", error: error.message });
  }
};

// ─── MENU MANAGEMENT ────────────────────────────────────────────────────────

const getAllMenuItems = async (req, res) => {
  try {
    const { restaurantId, search } = req.query;
    let sql = `
      SELECT m.id, m.name, m.price, m.description, m.image_url, m.category,
             m.restaurant_id, r.name AS restaurant_name
      FROM menu_items m
      JOIN restaurants r ON r.id = m.restaurant_id
      WHERE 1=1
    `;
    const params = [];
    if (restaurantId) {
      sql += " AND m.restaurant_id = ?";
      params.push(restaurantId);
    }
    if (search) {
      sql += " AND (m.name LIKE ? OR r.name LIKE ?)";
      const s = `%${search}%`;
      params.push(s, s);
    }
    sql += " ORDER BY m.id DESC";
    const [rows] = await pool.query(sql, params);
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch menu items", error: error.message });
  }
};

const adminUpdateMenuItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { name, price, description, category, image_url } = req.body;

    const [existing] = await pool.query("SELECT * FROM menu_items WHERE id = ?", [itemId]);
    if (!existing.length) return res.status(404).json({ message: "Menu item not found" });

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    let finalImage = existing[0].image_url;
    if (req.file) finalImage = `${baseUrl}/uploads/${req.file.filename}`;
    else if (image_url !== undefined && image_url !== "") finalImage = image_url;

    const ex = existing[0];
    await pool.query(
      `UPDATE menu_items SET name = ?, price = ?, description = ?, category = ?, image_url = ? WHERE id = ?`,
      [name ?? ex.name, price ?? ex.price, description ?? ex.description, category ?? ex.category, finalImage, itemId]
    );

    return res.json({ message: "Menu item updated" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update menu item", error: error.message });
  }
};

const adminDeleteMenuItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const [result] = await pool.query("DELETE FROM menu_items WHERE id = ?", [itemId]);
    if (!result.affectedRows) return res.status(404).json({ message: "Menu item not found" });
    return res.json({ message: "Menu item deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete menu item", error: error.message });
  }
};

// ─── ORDER MANAGEMENT ───────────────────────────────────────────────────────

const getAllOrders = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let sql = `
      SELECT o.id, o.total_price, o.status, o.created_at,
             o.payment_method, o.payment_status, o.delivery_fee,
             o.service_fee, o.vat, o.rider_tip, o.delivery_address, o.contact_info,
             o.assigned_rider_id, o.delivery_status,
             u.name AS customer_name, u.email AS customer_email,
             r.name AS restaurant_name,
             rd.name AS rider_name
      FROM orders o
      JOIN users u ON u.id = o.user_id
      JOIN restaurants r ON r.id = o.restaurant_id
      LEFT JOIN riders rd ON rd.id = o.assigned_rider_id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += " AND o.status = ?";
      params.push(status);
    }
    if (search) {
      sql += " AND (u.name LIKE ? OR r.name LIKE ? OR o.id LIKE ?)";
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    // Count total
    const countSql = sql.replace(
      /SELECT .* FROM orders/s,
      "SELECT COUNT(*) AS total FROM orders"
    );
    const [[{ total }]] = await pool.query(countSql, params);

    sql += " ORDER BY o.created_at DESC LIMIT ? OFFSET ?";
    params.push(Number(limit), offset);

    const [orders] = await pool.query(sql, params);
    return res.json({ orders, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch orders", error: error.message });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const [orders] = await pool.query(
      `SELECT o.*, u.name AS customer_name, u.email AS customer_email,
              r.name AS restaurant_name,
              rd.name AS rider_name, rd.phone AS rider_phone,
              rd.vehicle_type AS rider_vehicle_type, rd.vehicle_number AS rider_vehicle_number
       FROM orders o
       JOIN users u ON u.id = o.user_id
       JOIN restaurants r ON r.id = o.restaurant_id
       LEFT JOIN riders rd ON rd.id = o.assigned_rider_id
       WHERE o.id = ?`,
      [id]
    );
    if (!orders.length) return res.status(404).json({ message: "Order not found" });

    const [items] = await pool.query(
      `SELECT oi.quantity, mi.name, mi.price, mi.image_url
       FROM order_items oi
       JOIN menu_items mi ON mi.id = oi.item_id
       WHERE oi.order_id = ?`,
      [id]
    );

    return res.json({ ...orders[0], items });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch order", error: error.message });
  }
};

// ─── USER MANAGEMENT ────────────────────────────────────────────────────────

const getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    let sql = `
      SELECT u.id, u.name, u.email, u.role, u.is_blocked, u.created_at,
             r.id AS restaurant_id, r.name AS restaurant_name
      FROM users u
      LEFT JOIN restaurants r ON r.user_id = u.id
      WHERE u.role != 'admin'
    `;
    const params = [];

    if (role) {
      sql += " AND u.role = ?";
      params.push(role);
    }
    if (search) {
      sql += " AND (u.name LIKE ? OR u.email LIKE ?)";
      const s = `%${search}%`;
      params.push(s, s);
    }

    sql += " ORDER BY u.created_at DESC";
    const [rows] = await pool.query(sql, params);
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch users", error: error.message });
  }
};

const toggleUserBlock = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT is_blocked, role FROM users WHERE id = ?", [id]);
    if (!rows.length) return res.status(404).json({ message: "User not found" });
    if (rows[0].role === "admin") return res.status(403).json({ message: "Cannot block admin" });

    const newStatus = rows[0].is_blocked ? 0 : 1;
    await pool.query("UPDATE users SET is_blocked = ? WHERE id = ?", [newStatus, id]);
    return res.json({ message: `User ${newStatus ? "blocked" : "unblocked"}`, is_blocked: newStatus });
  } catch (error) {
    return res.status(500).json({ message: "Failed to toggle block", error: error.message });
  }
};

// ─── DEALS MANAGEMENT ───────────────────────────────────────────────────────

const adminGetAllDeals = async (req, res) => {
  try {
    const { search } = req.query;
    let sql = `
      SELECT d.id, d.title, d.description, d.discount, d.image_url,
             d.valid_from, d.valid_until, d.is_featured, d.created_at,
             r.id AS restaurant_id, r.name AS restaurant_name
      FROM deals d
      JOIN restaurants r ON r.id = d.restaurant_id
      WHERE 1=1
    `;
    const params = [];
    if (search) {
      sql += " AND (d.title LIKE ? OR r.name LIKE ?)";
      const s = `%${search}%`;
      params.push(s, s);
    }
    sql += " ORDER BY d.id DESC";
    const [rows] = await pool.query(sql, params);
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch deals", error: error.message });
  }
};

const adminDeleteDeal = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query("DELETE FROM deals WHERE id = ?", [id]);
    if (!result.affectedRows) return res.status(404).json({ message: "Deal not found" });
    return res.json({ message: "Deal deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete deal", error: error.message });
  }
};

const toggleDealFeatured = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT is_featured FROM deals WHERE id = ?", [id]);
    if (!rows.length) return res.status(404).json({ message: "Deal not found" });

    const newVal = rows[0].is_featured ? 0 : 1;
    await pool.query("UPDATE deals SET is_featured = ? WHERE id = ?", [newVal, id]);
    return res.json({ message: `Deal ${newVal ? "featured" : "unfeatured"}`, is_featured: newVal });
  } catch (error) {
    return res.status(500).json({ message: "Failed to toggle featured", error: error.message });
  }
};

// ─── TOP BRANDS ─────────────────────────────────────────────────────────────

const getTopBrands = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT tb.id, tb.name, tb.image_url, tb.restaurant_id, tb.display_order,
              r.name AS restaurant_name
       FROM top_brands tb
       LEFT JOIN restaurants r ON r.id = tb.restaurant_id
       ORDER BY tb.display_order ASC, tb.id ASC`
    );
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch brands", error: error.message });
  }
};

const createTopBrand = async (req, res) => {
  try {
    const { name, restaurant_id, display_order } = req.body;
    if (!name) return res.status(400).json({ message: "Brand name is required" });

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const imageUrl = req.file ? `${baseUrl}/uploads/${req.file.filename}` : null;

    const [result] = await pool.query(
      "INSERT INTO top_brands (name, image_url, restaurant_id, display_order) VALUES (?, ?, ?, ?)",
      [name, imageUrl, restaurant_id || null, Number(display_order) || 0]
    );
    return res.status(201).json({ message: "Brand created", id: result.insertId });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create brand", error: error.message });
  }
};

const updateTopBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, restaurant_id, display_order, image_url } = req.body;

    const [existing] = await pool.query("SELECT * FROM top_brands WHERE id = ?", [id]);
    if (!existing.length) return res.status(404).json({ message: "Brand not found" });

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    let finalImage = existing[0].image_url;
    if (req.file) finalImage = `${baseUrl}/uploads/${req.file.filename}`;
    else if (image_url !== undefined && image_url !== "") finalImage = image_url;

    const ex = existing[0];
    await pool.query(
      "UPDATE top_brands SET name = ?, image_url = ?, restaurant_id = ?, display_order = ? WHERE id = ?",
      [name ?? ex.name, finalImage, restaurant_id ?? ex.restaurant_id, display_order !== undefined ? Number(display_order) : ex.display_order, id]
    );
    return res.json({ message: "Brand updated" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update brand", error: error.message });
  }
};

const deleteTopBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query("DELETE FROM top_brands WHERE id = ?", [id]);
    if (!result.affectedRows) return res.status(404).json({ message: "Brand not found" });
    return res.json({ message: "Brand deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete brand", error: error.message });
  }
};

// ─── ANALYTICS ──────────────────────────────────────────────────────────────

const getAnalytics = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    // Orders per day
    const [ordersPerDay] = await pool.query(
      `SELECT DATE(created_at) AS date, COUNT(*) AS orders, COALESCE(SUM(total_price),0) AS revenue
       FROM orders
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      [Number(days)]
    );

    // Top restaurants by order count
    const [topRestaurants] = await pool.query(
      `SELECT r.name, COUNT(o.id) AS order_count, COALESCE(SUM(o.total_price),0) AS revenue
       FROM orders o
       JOIN restaurants r ON r.id = o.restaurant_id
       WHERE o.created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY r.id
       ORDER BY order_count DESC LIMIT 10`,
      [Number(days)]
    );

    // Top menu items
    const [topMenuItems] = await pool.query(
      `SELECT mi.name, r.name AS restaurant_name, SUM(oi.quantity) AS total_ordered
       FROM order_items oi
       JOIN menu_items mi ON mi.id = oi.item_id
       JOIN restaurants r ON r.id = mi.restaurant_id
       JOIN orders o ON o.id = oi.order_id
       WHERE o.created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY mi.id
       ORDER BY total_ordered DESC LIMIT 10`,
      [Number(days)]
    );

    // Revenue by payment method
    const [revenueByPayment] = await pool.query(
      `SELECT COALESCE(payment_method, 'cod') AS method, COUNT(*) AS count, COALESCE(SUM(total_price),0) AS revenue
       FROM orders
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY payment_method`,
      [Number(days)]
    );

    return res.json({ ordersPerDay, topRestaurants, topMenuItems, revenueByPayment });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch analytics", error: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAllRestaurants,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  toggleRestaurantStatus,
  getAllMenuItems,
  adminUpdateMenuItem,
  adminDeleteMenuItem,
  getAllOrders,
  getOrderDetails,
  getAllUsers,
  toggleUserBlock,
  adminGetAllDeals,
  adminDeleteDeal,
  toggleDealFeatured,
  getTopBrands,
  createTopBrand,
  updateTopBrand,
  deleteTopBrand,
  getAnalytics,
};
