const express = require("express");
const { auth, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
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
} = require("../controllers/adminController");

const router = express.Router();

// All admin routes require auth + admin role
router.use(auth, authorize("admin"));

// Dashboard
router.get("/stats", getDashboardStats);
router.get("/analytics", getAnalytics);

// Restaurants
router.get("/restaurants", getAllRestaurants);
router.post("/restaurants", upload.single("image"), createRestaurant);
router.put("/restaurants/:id", upload.single("image"), updateRestaurant);
router.delete("/restaurants/:id", deleteRestaurant);
router.patch("/restaurants/:id/toggle-status", toggleRestaurantStatus);

// Menu
router.get("/menu", getAllMenuItems);
router.put("/menu/:itemId", upload.single("image"), adminUpdateMenuItem);
router.delete("/menu/:itemId", adminDeleteMenuItem);

// Orders
router.get("/orders", getAllOrders);
router.get("/orders/:id", getOrderDetails);

// Users
router.get("/users", getAllUsers);
router.patch("/users/:id/toggle-block", toggleUserBlock);

// Deals
router.get("/deals", adminGetAllDeals);
router.delete("/deals/:id", adminDeleteDeal);
router.patch("/deals/:id/toggle-featured", toggleDealFeatured);

// Top Brands
router.get("/brands", getTopBrands);
router.post("/brands", upload.single("image"), createTopBrand);
router.put("/brands/:id", upload.single("image"), updateTopBrand);
router.delete("/brands/:id", deleteTopBrand);

module.exports = router;
