const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

/* ===========================
   CREATE (Insert Data)
=========================== */
app.post('/submit', (req, res) => {
  const { user_id, email, phone } = req.body;

  const sql = "INSERT INTO users (user_id, email, phone) VALUES (?, ?, ?)";
  db.query(sql, [user_id, email, phone], (err) => {
    if (err) return res.send(err);
    res.send("Data Saved Successfully");
  });
});

/* ===========================
   READ (Get All Users)
=========================== */
app.get('/users', (req, res) => {
  const sql = "SELECT * FROM users";
  db.query(sql, (err, result) => {
    if (err) return res.send(err);
    res.json(result);
  });
});

/* ===========================
   UPDATE (Update By ID)
=========================== */
app.put('/update/:id', (req, res) => {
  const { user_id, email, phone } = req.body;
  const id = req.params.id;

  const sql = "UPDATE users SET user_id=?, email=?, phone=? WHERE id=?";
  db.query(sql, [user_id, email, phone, id], (err) => {
    if (err) return res.send(err);
    res.send("User Updated Successfully");
  });
});

/* ===========================
   DELETE (Delete By ID)
=========================== */
app.delete('/delete/:id', (req, res) => {
  const id = req.params.id;

  const sql = "DELETE FROM users WHERE id=?";
  db.query(sql, [id], (err) => {
    if (err) return res.send(err);
    res.send("User Deleted Successfully");
  });
});

/* =========================== */

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});