require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");

// Connect MongoDB
const connectDB = require("./config/db");
connectDB();

// Body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.use("/users", require("./routes/userRoutes"));

// Redirect home to /users
app.get("/", (req, res) => {
  res.redirect("/users");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT} 🚀`));
