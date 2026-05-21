/**
 * Script: create_admin.js
 * Creates an admin user in the database.
 * Usage: node scripts/create_admin.js
 *
 * Default credentials:
 *   Email:    admin@foodify.com
 *   Password: Admin@1234
 */

require("dotenv").config();
const bcrypt = require("bcryptjs");
const pool = require("../src/config/db");

async function createAdmin() {
  const name = "Super Admin";
  const email = process.env.ADMIN_EMAIL || "admin@foodify.com";
  const password = process.env.ADMIN_PASSWORD || "Admin@1234";

  try {
    // Ensure admin role exists in ENUM (run migration first if needed)
    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length) {
      // Update role to admin if already exists
      await pool.query("UPDATE users SET role = 'admin' WHERE email = ?", [email]);
      console.log(`✓ Existing user '${email}' updated to admin role`);
    } else {
      const hashed = await bcrypt.hash(password, 10);
      await pool.query(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'admin')",
        [name, email, hashed]
      );
      console.log(`✓ Admin user created: ${email}`);
    }
    console.log(`  Email:    ${email}`);
    console.log(`  Password: ${password}`);
    console.log("\n✅ Done! You can now log in at /auth with these credentials.");
  } catch (err) {
    console.error("Failed to create admin:", err.message);
    console.error("Hint: Run the migration first: node src/migrations/add_admin_role.js");
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

createAdmin();
