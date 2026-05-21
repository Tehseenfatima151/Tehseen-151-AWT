/**
 * Rider Controller — full CRUD + assignment + stats
 */
const pool = require("../config/db");

// ─── GET ALL RIDERS ──────────────────────────────────────────────────────────
const getAllRiders = async (req, res) => {
  try {
    const { search, availability, active } = req.query;
    let sql = `
      SELECT r.*,
        (SELECT COUNT(*) FROM orders o WHERE o.assigned_rider_id = r.id) AS total_deliveries,
        (SELECT COUNT(*) FROM orders o WHERE o.assigned_rider_id = r.id AND DATE(o.created_at) = CURDATE()) AS deliveries_today,
        (SELECT COALESCE(SUM(o.rider_tip),0) FROM orders o WHERE o.assigned_rider_id = r.id) AS total_tips,
        (SELECT COUNT(*) FROM orders o WHERE o.assigned_rider_id = r.id AND o.delivery_status = 'delivered') AS completed_deliveries
      FROM riders r
      WHERE 1=1
    `;
    const params = [];
    if (search) {
      sql += " AND (r.name LIKE ? OR r.phone LIKE ? OR r.email LIKE ?)";
      const s = `%${search}%`;
      params.push(s, s, s);
    }
    if (availability) { sql += " AND r.availability = ?"; params.push(availability); }
    if (active !== undefined) { sql += " AND r.is_active = ?"; params.push(active === "1" ? 1 : 0); }
    sql += " ORDER BY r.id DESC";
    const [rows] = await pool.query(sql, params);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch riders", error: err.message });
  }
};

// ─── GET SINGLE RIDER ────────────────────────────────────────────────────────
const getRiderById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT r.*,
         (SELECT COUNT(*) FROM orders o WHERE o.assigned_rider_id = r.id) AS total_deliveries,
         (SELECT COALESCE(SUM(o.rider_tip),0) FROM orders o WHERE o.assigned_rider_id = r.id) AS total_tips,
         (SELECT COUNT(*) FROM orders o WHERE o.assigned_rider_id = r.id AND o.delivery_status='delivered') AS completed_deliveries
       FROM riders r WHERE r.id = ?`, [id]
    );
    if (!rows.length) return res.status(404).json({ message: "Rider not found" });

    // Recent assignments
    const [recentOrders] = await pool.query(
      `SELECT o.id, o.total_price, o.rider_tip, o.delivery_status, o.created_at,
              u.name AS customer_name, rest.name AS restaurant_name
       FROM orders o
       JOIN users u ON u.id = o.user_id
       JOIN restaurants rest ON rest.id = o.restaurant_id
       WHERE o.assigned_rider_id = ?
       ORDER BY o.created_at DESC LIMIT 10`, [id]
    );
    return res.json({ ...rows[0], recentOrders });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch rider", error: err.message });
  }
};

// ─── CREATE RIDER ────────────────────────────────────────────────────────────
const createRider = async (req, res) => {
  try {
    const { name, phone, email, cnic, vehicle_type, vehicle_number, availability } = req.body;
    if (!name || !phone) return res.status(400).json({ message: "Name and phone are required" });

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const imageUrl = req.file ? `${baseUrl}/uploads/${req.file.filename}` : null;

    const [result] = await pool.query(
      `INSERT INTO riders (name, phone, email, cnic, vehicle_type, vehicle_number, image_url, availability)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, phone, email || null, cnic || null,
       vehicle_type || "bike", vehicle_number || null,
       imageUrl, availability || "offline"]
    );
    return res.status(201).json({ message: "Rider created", id: result.insertId });
  } catch (err) {
    return res.status(500).json({ message: "Failed to create rider", error: err.message });
  }
};

// ─── UPDATE RIDER ────────────────────────────────────────────────────────────
const updateRider = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, cnic, vehicle_type, vehicle_number, availability, is_active, image_url } = req.body;

    const [existing] = await pool.query("SELECT * FROM riders WHERE id = ?", [id]);
    if (!existing.length) return res.status(404).json({ message: "Rider not found" });
    const ex = existing[0];

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    let finalImage = ex.image_url;
    if (req.file) finalImage = `${baseUrl}/uploads/${req.file.filename}`;
    else if (image_url !== undefined && image_url !== "") finalImage = image_url;

    await pool.query(
      `UPDATE riders SET name=?, phone=?, email=?, cnic=?, vehicle_type=?,
       vehicle_number=?, image_url=?, availability=?, is_active=? WHERE id=?`,
      [
        name ?? ex.name, phone ?? ex.phone, email ?? ex.email,
        cnic ?? ex.cnic, vehicle_type ?? ex.vehicle_type,
        vehicle_number ?? ex.vehicle_number, finalImage,
        availability ?? ex.availability,
        is_active !== undefined ? (is_active === "true" || is_active === true ? 1 : 0) : ex.is_active,
        id,
      ]
    );
    return res.json({ message: "Rider updated" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to update rider", error: err.message });
  }
};

// ─── DELETE RIDER ────────────────────────────────────────────────────────────
const deleteRider = async (req, res) => {
  try {
    const { id } = req.params;
    // Unassign from orders first
    await pool.query("UPDATE orders SET assigned_rider_id = NULL WHERE assigned_rider_id = ?", [id]);
    const [result] = await pool.query("DELETE FROM riders WHERE id = ?", [id]);
    if (!result.affectedRows) return res.status(404).json({ message: "Rider not found" });
    return res.json({ message: "Rider deleted" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete rider", error: err.message });
  }
};

// ─── TOGGLE ACTIVE ───────────────────────────────────────────────────────────
const toggleRiderActive = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT is_active FROM riders WHERE id = ?", [id]);
    if (!rows.length) return res.status(404).json({ message: "Rider not found" });
    const newVal = rows[0].is_active ? 0 : 1;
    await pool.query("UPDATE riders SET is_active = ? WHERE id = ?", [newVal, id]);
    return res.json({ message: `Rider ${newVal ? "activated" : "deactivated"}`, is_active: newVal });
  } catch (err) {
    return res.status(500).json({ message: "Failed to toggle", error: err.message });
  }
};

// ─── TOGGLE AVAILABILITY ─────────────────────────────────────────────────────
const toggleRiderAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT availability FROM riders WHERE id = ?", [id]);
    if (!rows.length) return res.status(404).json({ message: "Rider not found" });
    const newVal = rows[0].availability === "online" ? "offline" : "online";
    await pool.query("UPDATE riders SET availability = ? WHERE id = ?", [newVal, id]);
    return res.json({ message: `Rider is now ${newVal}`, availability: newVal });
  } catch (err) {
    return res.status(500).json({ message: "Failed to toggle availability", error: err.message });
  }
};

// ─── ASSIGN RIDER TO ORDER ───────────────────────────────────────────────────
const assignRiderToOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { rider_id } = req.body;

    const [order] = await pool.query("SELECT id, status FROM orders WHERE id = ?", [orderId]);
    if (!order.length) return res.status(404).json({ message: "Order not found" });

    if (rider_id) {
      const [rider] = await pool.query("SELECT id FROM riders WHERE id = ? AND is_active = 1", [rider_id]);
      if (!rider.length) return res.status(404).json({ message: "Rider not found or inactive" });
    }

    await pool.query(
      "UPDATE orders SET assigned_rider_id = ?, delivery_status = ? WHERE id = ?",
      [rider_id || null, rider_id ? "confirmed" : "pending", orderId]
    );
    return res.json({ message: rider_id ? "Rider assigned" : "Rider unassigned" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to assign rider", error: err.message });
  }
};

// ─── UPDATE DELIVERY STATUS ──────────────────────────────────────────────────
const updateDeliveryStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { delivery_status } = req.body;
    const valid = ["pending","confirmed","preparing","picked_up","on_the_way","delivered"];
    if (!valid.includes(delivery_status)) {
      return res.status(400).json({ message: "Invalid delivery status" });
    }
    const [result] = await pool.query(
      "UPDATE orders SET delivery_status = ? WHERE id = ?",
      [delivery_status, orderId]
    );
    if (!result.affectedRows) return res.status(404).json({ message: "Order not found" });
    return res.json({ message: "Delivery status updated" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to update delivery status", error: err.message });
  }
};

// ─── RIDER STATS SUMMARY ─────────────────────────────────────────────────────
const getRiderStats = async (_req, res) => {
  try {
    const [[stats]] = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM riders)                                                          AS totalRiders,
        (SELECT COUNT(*) FROM riders WHERE availability='online' AND is_active=1)              AS onlineRiders,
        (SELECT COUNT(*) FROM riders WHERE is_active=1)                                        AS activeRiders,
        (SELECT COALESCE(SUM(rider_tip),0) FROM orders)                                        AS totalTips,
        (SELECT COUNT(*) FROM orders WHERE delivery_status='delivered'
          AND DATE(created_at)=CURDATE())                                                       AS deliveriesToday
    `);
    return res.json({
      totalRiders:    Number(stats.totalRiders),
      onlineRiders:   Number(stats.onlineRiders),
      activeRiders:   Number(stats.activeRiders),
      totalTips:      Number(stats.totalTips),
      deliveriesToday:Number(stats.deliveriesToday),
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch stats", error: err.message });
  }
};

module.exports = {
  getAllRiders, getRiderById, createRider, updateRider,
  deleteRider, toggleRiderActive, toggleRiderAvailability,
  assignRiderToOrder, updateDeliveryStatus, getRiderStats,
};
