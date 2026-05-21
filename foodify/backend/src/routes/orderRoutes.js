const express = require("express");
const { placeOrder, getMyOrders } = require("../controllers/orderController");
const { auth, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", auth, authorize("customer"), placeOrder);
router.get("/", auth, authorize("customer"), getMyOrders);

module.exports = router;
