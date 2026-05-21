const express = require("express");
const cors = require("cors");

const authRoutes       = require("./routes/authRoutes");
const restaurantRoutes = require("./routes/restaurantRoutes");
const menuRoutes       = require("./routes/menuRoutes");
const orderRoutes      = require("./routes/orderRoutes");
const searchRoutes     = require("./routes/searchRoutes");
const dealsRoutes      = require("./routes/dealsRoutes");
const favoritesRoutes  = require("./routes/favoritesRoutes");
const paymentRoutes    = require("./routes/paymentRoutes");
const adminRoutes      = require("./routes/adminRoutes");
const riderRoutes      = require("./routes/riderRoutes");

const app = express();

const path = require("path");

app.use(cors());
app.use(express.json());

// Serve static uploaded files
app.use("/uploads", express.static(path.join(__dirname, "../../public/uploads")));

app.get("/", (_req, res) => {
  res.json({ message: "Foodify API is running" });
});

app.use("/api/auth",        authRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/menu",        menuRoutes);
app.use("/api/orders",      orderRoutes);
app.use("/api/search",      searchRoutes);
app.use("/api/deals",       dealsRoutes);
app.use("/api/favorites",   favoritesRoutes);
app.use("/api/payment",     paymentRoutes);
app.use("/api/admin",       adminRoutes);
app.use("/api/riders",      riderRoutes);

module.exports = app;
