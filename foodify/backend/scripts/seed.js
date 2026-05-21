require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

const runSeed = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "foodify",
    multipleStatements: true,
  });

  try {
    const seedPath = path.join(__dirname, "..", "sql", "seed.sql");
    const sql = fs.readFileSync(seedPath, "utf8");
    await connection.query(sql);
    console.log("Seed completed successfully.");
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await connection.end();
  }
};

runSeed();
