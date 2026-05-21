const mysql = require("mysql2/promise");
require("dotenv").config({ path: require('path').resolve(__dirname, '../.env') });

async function init() {
  try {
    console.log("Connecting to MySQL...");
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      multipleStatements: true
    });
    const dbName = process.env.DB_NAME || "foodify_db";
    
    console.log(`Creating database ${dbName}...`);
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    
    console.log(`Switching to ${dbName}...`);
    await conn.changeUser({ database: dbName });
    
    const fs = require("fs");
    const path = require("path");
    
    console.log("Importing schema...");
    const schemaSql = fs.readFileSync(path.join(__dirname, "..", "sql", "schema.sql"), "utf8");
    if(schemaSql.trim()) {
      await conn.query(schemaSql);
    }
    
    console.log("Database initialized successfully!");
    await conn.end();
  } catch(e) {
    console.error("Error setting up DB:", e.message);
  }
}
init();
