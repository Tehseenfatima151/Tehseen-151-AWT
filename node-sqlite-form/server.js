const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Database
const db = new sqlite3.Database("database.db");

// Create table
db.run(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    phone TEXT
)
`);

/* ========================
   CREATE
======================== */
app.post("/save", (req, res) => {
    const { name, phone } = req.body;

    db.run(
        "INSERT INTO users (name, phone) VALUES (?, ?)",
        [name, phone],
        function (err) {
            if (err) return res.send("Error saving data ❌");
            res.send("Saved Successfully ✅");
        }
    );
});

/* ========================
   READ
======================== */
app.get("/users", (req, res) => {
    db.all("SELECT * FROM users", [], (err, rows) => {
        if (err) return res.send("Error fetching data");
        res.json(rows);
    });
});

/* ========================
   UPDATE
======================== */
app.put("/update/:id", (req, res) => {
    const { name, phone } = req.body;
    const id = req.params.id;

    db.run(
        "UPDATE users SET name = ?, phone = ? WHERE id = ?",
        [name, phone, id],
        function (err) {
            if (err) return res.send("Error updating data");
            res.send("User Updated Successfully ✅");
        }
    );
});

/* ========================
   DELETE
======================== */
app.delete("/delete/:id", (req, res) => {
    const id = req.params.id;

    db.run("DELETE FROM users WHERE id = ?", [id], function (err) {
        if (err) return res.send("Error deleting data");
        res.send("User Deleted Successfully ✅");
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});