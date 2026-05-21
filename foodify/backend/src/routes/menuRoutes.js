const express = require("express");
const {
  getMenuByRestaurant,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require("../controllers/menuController");
const { auth, authorize } = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/restaurant/:restaurantId", getMenuByRestaurant);
router.post("/", auth, authorize("restaurant"), upload.single("image"), addMenuItem);
router.put("/:itemId", auth, authorize("restaurant"), upload.single("image"), updateMenuItem);
router.delete("/:itemId", auth, authorize("restaurant"), deleteMenuItem);

module.exports = router;
