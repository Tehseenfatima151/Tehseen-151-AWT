const express = require("express");
const { auth, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
  getAllRiders, getRiderById, createRider, updateRider,
  deleteRider, toggleRiderActive, toggleRiderAvailability,
  assignRiderToOrder, updateDeliveryStatus, getRiderStats,
} = require("../controllers/riderController");

const router = express.Router();

// All routes require admin auth
router.use(auth, authorize("admin"));

// ── Static / non-param routes FIRST (before /:id) ──────────────────────────
router.get("/stats", getRiderStats);

// ── Order assignment routes (must be before /:id) ──────────────────────────
router.patch("/orders/:orderId/assign",          assignRiderToOrder);
router.patch("/orders/:orderId/delivery-status", updateDeliveryStatus);

// ── Collection routes ───────────────────────────────────────────────────────
router.get("/",  getAllRiders);
router.post("/", upload.single("image"), createRider);

// ── Param routes LAST ───────────────────────────────────────────────────────
router.get("/:id",                       getRiderById);
router.put("/:id", upload.single("image"), updateRider);
router.delete("/:id",                    deleteRider);
router.patch("/:id/toggle-active",       toggleRiderActive);
router.patch("/:id/toggle-availability", toggleRiderAvailability);

module.exports = router;
