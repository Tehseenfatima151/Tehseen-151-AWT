const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const { auth, authorize } = require("../middleware/authMiddleware");
const {
  getAllDeals,
  getDealsByRestaurant,
  getMyDeals,
  createDeal,
  updateDeal,
  deleteDeal,
} = require("../controllers/dealsController");

const router = express.Router();

router.get("/", getAllDeals);
router.get("/mine", auth, authorize("restaurant"), getMyDeals);
router.get("/restaurant/:restaurantId", getDealsByRestaurant);
router.post("/", auth, authorize("restaurant"), upload.single("image"), createDeal);
router.put("/:id", auth, authorize("restaurant"), upload.single("image"), updateDeal);
router.delete("/:id", auth, authorize("restaurant"), deleteDeal);

module.exports = router;
