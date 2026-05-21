const express = require("express");
const { toggleFavorite, getFavorites, getFavoriteIds } = require("../controllers/favoritesController");
const { auth, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// All favorites routes require customer auth
router.post("/toggle",  auth, authorize("customer"), toggleFavorite);
router.get("/",        auth, authorize("customer"), getFavorites);
router.get("/ids",     auth, authorize("customer"), getFavoriteIds);

module.exports = router;
