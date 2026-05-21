const express = require("express");
const {
  getRestaurants,
  getRestaurantOrders,
  acceptOrder,
  getMyRestaurant,
  updateOrderStatus,
} = require("../controllers/restaurantController");
const { auth, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getRestaurants);
router.get("/me", auth, authorize("restaurant"), getMyRestaurant);
router.get("/dashboard/orders", auth, authorize("restaurant"), getRestaurantOrders);
router.patch("/dashboard/orders/:orderId/accept", auth, authorize("restaurant"), acceptOrder);
router.patch("/dashboard/orders/:orderId/status", auth, authorize("restaurant"), updateOrderStatus);

module.exports = router;
