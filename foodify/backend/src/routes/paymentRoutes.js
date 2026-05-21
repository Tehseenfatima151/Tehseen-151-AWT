const express = require("express");
const { createPaymentIntent } = require("../controllers/paymentController");
const { auth } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create-intent", auth, createPaymentIntent);

module.exports = router;
