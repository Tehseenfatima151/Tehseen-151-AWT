const pool = require("../config/db");

const placeOrder = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { 
      restaurantId, 
      items, 
      paymentMethod = "cod", 
      paymentStatus = "pending", 
      transactionId = null, 
      deliveryAddress = null, 
      contactInfo = null,
      deliveryFee = 0,
      serviceFee = 0,
      vat = 0,
      riderTip = 0 
    } = req.body;
    
    if (!restaurantId || !Array.isArray(items) || !items.length) {
      return res.status(400).json({ message: "Restaurant and items are required" });
    }

    const itemIds = items.map((item) => item.itemId);
    const [menuItems] = await connection.query(
      `SELECT id, price FROM menu_items WHERE restaurant_id = ? AND id IN (${itemIds
        .map(() => "?")
        .join(",")})`,
      [restaurantId, ...itemIds]
    );

    if (menuItems.length !== items.length) {
      return res.status(400).json({ message: "Invalid items for this restaurant" });
    }

    const priceMap = new Map(menuItems.map((item) => [item.id, Number(item.price)]));
    const subtotal = items.reduce(
      (sum, item) => sum + (priceMap.get(item.itemId) || 0) * Number(item.quantity || 1),
      0
    );
    const totalPrice = Number(subtotal) + Number(deliveryFee) + Number(serviceFee) + Number(vat) + Number(riderTip);

    await connection.beginTransaction();
    const [orderResult] = await connection.query(
      "INSERT INTO orders (user_id, restaurant_id, total_price, status, payment_method, payment_status, stripe_payment_id, delivery_address, contact_info, delivery_fee, service_fee, vat, rider_tip) VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        req.user.id, 
        restaurantId, 
        totalPrice, 
        paymentMethod, 
        paymentStatus, 
        transactionId, 
        deliveryAddress ? JSON.stringify(deliveryAddress) : null, 
        contactInfo ? JSON.stringify(contactInfo) : null,
        Number(deliveryFee),
        Number(serviceFee),
        Number(vat),
        Number(riderTip)
      ]
    );

    for (const item of items) {
      await connection.query(
        "INSERT INTO order_items (order_id, item_id, quantity) VALUES (?, ?, ?)",
        [orderResult.insertId, item.itemId, item.quantity || 1]
      );
    }

    await connection.commit();
    return res.status(201).json({ message: "Order placed", orderId: orderResult.insertId });
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({ message: "Failed to place order", error: error.message });
  } finally {
    connection.release();
  }
};

const getMyOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.id, o.total_price, o.status,
              o.rider_tip, o.delivery_status,
              r.name AS restaurant_name,
              rd.name AS rider_name
       FROM orders o
       JOIN restaurants r ON r.id = o.restaurant_id
       LEFT JOIN riders rd ON rd.id = o.assigned_rider_id
       WHERE o.user_id = ?
       ORDER BY o.id DESC`,
      [req.user.id]
    );
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch orders", error: error.message });
  }
};

module.exports = { placeOrder, getMyOrders };
