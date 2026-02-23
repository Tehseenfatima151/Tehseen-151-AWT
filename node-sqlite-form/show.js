const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("database.db");

db.all("SELECT * FROM users", [], (err, rows) => {
  if (err) throw err;
  console.log("Saved Users:");
  console.table(rows);  // Shows data nicely in table format
  db.close();
});
