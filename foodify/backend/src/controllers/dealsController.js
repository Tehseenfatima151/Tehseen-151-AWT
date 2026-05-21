const pool = require("../config/db");

const getRestaurantIdForUser = async (userId) => {
  const [rows] = await pool.query("SELECT id FROM restaurants WHERE user_id = ?", [userId]);
  return rows[0]?.id ?? null;
};

const parseMenuItemIds = (raw) => {
  if (raw == null || raw === "") return null;
  if (typeof raw === "string") {
    try {
      const j = JSON.parse(raw);
      if (Array.isArray(j)) {
        const nums = j.map(Number).filter((n) => !Number.isNaN(n) && n > 0);
        return nums.length ? JSON.stringify(nums) : null;
      }
    } catch {
      /* fall through */
    }
    const nums = raw
      .split(/[,\s]+/)
      .map((s) => Number(s.trim()))
      .filter((n) => !Number.isNaN(n) && n > 0);
    return nums.length ? JSON.stringify(nums) : null;
  }
  if (Array.isArray(raw)) {
    const nums = raw.map(Number).filter((n) => !Number.isNaN(n) && n > 0);
    return nums.length ? JSON.stringify(nums) : null;
  }
  return null;
};

const parseStoredMenuIds = (row) => {
  if (!row?.menu_item_ids) return [];
  try {
    const v = row.menu_item_ids;
    const arr = typeof v === "string" ? JSON.parse(v) : v;
    return Array.isArray(arr) ? arr.map(Number).filter((n) => n > 0) : [];
  } catch {
    return [];
  }
};

const formatDealRow = (row) => {
  const disc = Number(row.discount);
  const safeDisc = Number.isFinite(disc) ? disc : 0;
  return {
    id: row.id,
    restaurant_id: row.restaurant_id,
    title: row.title,
    description: row.description || "",
    discount: safeDisc,
    discount_text: `${Math.round(safeDisc)}% OFF`,
    image_url: row.image_url,
    img_url: row.image_url,
    restaurant_name: row.restaurant_name,
    category: row.category,
    theme: row.id % 6,
    menu_item_ids: parseStoredMenuIds(row),
    valid_from: row.valid_from,
    valid_until: row.valid_until,
    created_at: row.created_at,
  };
};

const validityClause = `
  AND (d.valid_until IS NULL OR d.valid_until >= CURDATE())
  AND (d.valid_from IS NULL OR d.valid_from <= CURDATE())
`;

/**
 * GET /api/deals — all active deals (customer homepage)
 */
const getAllDeals = async (_req, res) => {
  try {
    const [deals] = await pool.query(
      `SELECT d.id, d.restaurant_id, d.title, d.description, d.discount, d.image_url, d.menu_item_ids,
              d.valid_from, d.valid_until, d.created_at,
              r.name AS restaurant_name, r.category
       FROM deals d
       JOIN restaurants r ON r.id = d.restaurant_id
       WHERE 1=1 ${validityClause}
       ORDER BY d.id DESC`
    );
    return res.json(deals.map(formatDealRow));
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch deals", error: error.message });
  }
};

/**
 * GET /api/deals/restaurant/:restaurantId — deals for one restaurant (public)
 */
const getDealsByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const [deals] = await pool.query(
      `SELECT d.id, d.restaurant_id, d.title, d.description, d.discount, d.image_url, d.menu_item_ids,
              d.valid_from, d.valid_until, d.created_at,
              r.name AS restaurant_name, r.category
       FROM deals d
       JOIN restaurants r ON r.id = d.restaurant_id
       WHERE d.restaurant_id = ? ${validityClause}
       ORDER BY d.id DESC`,
      [restaurantId]
    );
    return res.json(deals.map(formatDealRow));
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch deals", error: error.message });
  }
};

/**
 * GET /api/deals/mine — authenticated restaurant's deals (includes inactive dates for management)
 */
const getMyDeals = async (req, res) => {
  try {
    const restaurantId = await getRestaurantIdForUser(req.user.id);
    if (!restaurantId) return res.status(404).json({ message: "Restaurant not found" });

    const [deals] = await pool.query(
      `SELECT d.id, d.restaurant_id, d.title, d.description, d.discount, d.image_url, d.menu_item_ids,
              d.valid_from, d.valid_until, d.created_at,
              r.name AS restaurant_name, r.category
       FROM deals d
       JOIN restaurants r ON r.id = d.restaurant_id
       WHERE d.restaurant_id = ?
       ORDER BY d.id DESC`,
      [restaurantId]
    );
    return res.json(deals.map(formatDealRow));
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch deals", error: error.message });
  }
};

const createDeal = async (req, res) => {
  try {
    const { title, description, discount, menu_item_ids, valid_from, valid_until } = req.body;
    if (!title || title.trim() === "") {
      return res.status(400).json({ message: "Title is required" });
    }
    if (discount === undefined || discount === "" || Number.isNaN(Number(discount))) {
      return res.status(400).json({ message: "Discount percentage is required" });
    }

    const restaurantId = await getRestaurantIdForUser(req.user.id);
    if (!restaurantId) return res.status(404).json({ message: "Restaurant not found" });

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const imageUrl = req.file ? `${baseUrl}/uploads/${req.file.filename}` : null;

    const [result] = await pool.query(
      `INSERT INTO deals (restaurant_id, title, description, discount, image_url, menu_item_ids, valid_from, valid_until)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        restaurantId,
        title.trim(),
        description || "",
        Number(discount),
        imageUrl,
        parseMenuItemIds(menu_item_ids),
        valid_from || null,
        valid_until || null,
      ]
    );

    return res.status(201).json({ message: "Deal created", id: result.insertId });
  } catch (error) {
    const sql = error.sqlMessage || "";
    const hint =
      sql.includes("Unknown column") || sql.includes("discount")
        ? " Run: node src/migrations/create_deals_table.js (upgrades old deals table)."
        : "";
    return res.status(500).json({
      message: "Failed to create deal",
      error: error.message,
      sqlMessage: sql || undefined,
      hint: hint || undefined,
    });
  }
};

const updateDeal = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, discount, menu_item_ids, valid_from, valid_until, image_url, clear_image } = req.body;

    const restaurantId = await getRestaurantIdForUser(req.user.id);
    if (!restaurantId) return res.status(404).json({ message: "Restaurant not found" });

    const [existing] = await pool.query("SELECT * FROM deals WHERE id = ? AND restaurant_id = ?", [id, restaurantId]);
    if (!existing.length) return res.status(404).json({ message: "Deal not found" });

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    let finalImage = existing[0].image_url;
    if (req.file) finalImage = `${baseUrl}/uploads/${req.file.filename}`;
    else if (clear_image === "true" || clear_image === true) finalImage = null;
    else if (image_url !== undefined && image_url !== "") finalImage = image_url;

    const ex = existing[0];
    const nextTitle = title !== undefined ? String(title).trim() : ex.title;
    const nextDesc = description !== undefined ? description : ex.description;
    const nextDisc =
      discount !== undefined && discount !== "" ? Number(discount) : Number(ex.discount);
    let nextMenuIds = ex.menu_item_ids;
    if (menu_item_ids !== undefined) {
      nextMenuIds = parseMenuItemIds(menu_item_ids);
    }
    const nextValidFrom = valid_from !== undefined ? valid_from || null : ex.valid_from;
    const nextValidUntil = valid_until !== undefined ? valid_until || null : ex.valid_until;

    const [result] = await pool.query(
      `UPDATE deals SET title = ?, description = ?, discount = ?, image_url = ?, menu_item_ids = ?, valid_from = ?, valid_until = ?
       WHERE id = ? AND restaurant_id = ?`,
      [
        nextTitle,
        nextDesc || "",
        nextDisc,
        finalImage,
        nextMenuIds,
        nextValidFrom,
        nextValidUntil,
        id,
        restaurantId,
      ]
    );

    if (!result.affectedRows) return res.status(404).json({ message: "Deal not found" });
    return res.json({ message: "Deal updated" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update deal", error: error.message });
  }
};

const deleteDeal = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurantId = await getRestaurantIdForUser(req.user.id);
    if (!restaurantId) return res.status(404).json({ message: "Restaurant not found" });

    const [result] = await pool.query("DELETE FROM deals WHERE id = ? AND restaurant_id = ?", [id, restaurantId]);
    if (!result.affectedRows) return res.status(404).json({ message: "Deal not found" });
    return res.json({ message: "Deal deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete deal", error: error.message });
  }
};

module.exports = {
  getAllDeals,
  getDealsByRestaurant,
  getMyDeals,
  createDeal,
  updateDeal,
  deleteDeal,
};
