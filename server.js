const express = require("express");
const { Pool } = require("pg");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// PostgreSQL database setup
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL || "postgresql://localhost:5432/users_db",
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// Initialize database
async function initializeDatabase() {
  try {
    // Create users table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        age INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Just check user count for logging
    const result = await pool.query("SELECT COUNT(*) FROM users");
    const count = parseInt(result.rows[0].count);
    console.log(`Database ready - ${count} users found`);

    console.log("PostgreSQL database initialized successfully");
  } catch (error) {
    console.error("Database initialization error:", error);
    // Fallback to in-memory storage if database connection fails
    console.log("Falling back to in-memory storage for development");
    global.fallbackMode = true;
    global.users = []; // Start with empty users array
    global.nextId = 1;
  }
}

// Initialize database on startup
initializeDatabase();

// Helper function to validate email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Routes

// Serve HTML interface
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// API Routes

// Get all users
app.get("/api/users", async (req, res) => {
  try {
    if (global.fallbackMode) {
      // Fallback to in-memory storage
      const sortedUsers = [...global.users].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      res.json({
        success: true,
        users: sortedUsers,
        count: sortedUsers.length,
      });
      return;
    }

    const result = await pool.query(
      "SELECT * FROM users ORDER BY created_at DESC"
    );
    res.json({ success: true, users: result.rows, count: result.rows.length });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Get user by ID
app.get("/api/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    if (global.fallbackMode) {
      // Fallback to in-memory storage
      const user = global.users.find((u) => u.id === parseInt(userId));
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      res.json({ success: true, user });
      return;
    }

    const result = await pool.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Create new user
app.post("/api/users", async (req, res) => {
  const { name, email, age } = req.body;

  // Validation
  if (!name || !email) {
    res.status(400).json({ error: "Name and email are required" });
    return;
  }

  if (!isValidEmail(email)) {
    res.status(400).json({ error: "Invalid email format" });
    return;
  }

  try {
    if (global.fallbackMode) {
      // Fallback to in-memory storage
      const existingUser = global.users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );
      if (existingUser) {
        res.status(400).json({ error: "Email already exists" });
        return;
      }

      const newUser = {
        id: global.nextId++,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        age: age ? parseInt(age) : null,
        created_at: new Date().toISOString(),
      };

      global.users.push(newUser);
      res.status(201).json({
        success: true,
        message: "User created successfully",
        user: newUser,
      });
      return;
    }

    const result = await pool.query(
      "INSERT INTO users (name, email, age) VALUES ($1, $2, $3) RETURNING *",
      [name.trim(), email.trim().toLowerCase(), age || null]
    );

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating user:", error);
    if (error.code === "23505") {
      // PostgreSQL unique constraint violation
      res.status(400).json({ error: "Email already exists" });
    } else {
      res.status(500).json({ error: "Failed to create user" });
    }
  }
});

// Update user
app.put("/api/users/:id", async (req, res) => {
  const userId = req.params.id;
  const { name, email, age } = req.body;

  // Validation
  if (!name || !email) {
    res.status(400).json({ error: "Name and email are required" });
    return;
  }

  if (!isValidEmail(email)) {
    res.status(400).json({ error: "Invalid email format" });
    return;
  }

  try {
    if (global.fallbackMode) {
      // Fallback to in-memory storage
      const userIndex = global.users.findIndex(
        (u) => u.id === parseInt(userId)
      );
      if (userIndex === -1) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const existingUser = global.users.find(
        (u) =>
          u.email.toLowerCase() === email.toLowerCase() &&
          u.id !== parseInt(userId)
      );
      if (existingUser) {
        res.status(400).json({ error: "Email already exists" });
        return;
      }

      global.users[userIndex] = {
        ...global.users[userIndex],
        name: name.trim(),
        email: email.trim().toLowerCase(),
        age: age ? parseInt(age) : null,
      };

      res.json({
        success: true,
        message: "User updated successfully",
        user: global.users[userIndex],
      });
      return;
    }

    const result = await pool.query(
      "UPDATE users SET name = $1, email = $2, age = $3 WHERE id = $4 RETURNING *",
      [name.trim(), email.trim().toLowerCase(), age || null, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({
      success: true,
      message: "User updated successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating user:", error);
    if (error.code === "23505") {
      // PostgreSQL unique constraint violation
      res.status(400).json({ error: "Email already exists" });
    } else {
      res.status(500).json({ error: "Failed to update user" });
    }
  }
});

// Delete user
app.delete("/api/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    if (global.fallbackMode) {
      // Fallback to in-memory storage
      const userIndex = global.users.findIndex(
        (u) => u.id === parseInt(userId)
      );
      if (userIndex === -1) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      global.users.splice(userIndex, 1);
      res.json({ success: true, message: "User deleted successfully" });
      return;
    }

    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING id",
      [userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    let userCount = 0;
    let databaseType = "PostgreSQL";

    if (global.fallbackMode) {
      userCount = global.users.length;
      databaseType = "In-Memory (Fallback)";
    } else {
      const result = await pool.query("SELECT COUNT(*) FROM users");
      userCount = parseInt(result.rows[0].count);
    }

    res.json({
      success: true,
      message: "API is running with database",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      database: databaseType,
      userCount: userCount,
    });
  } catch (error) {
    res.json({
      success: true,
      message: "API is running (database connection issue)",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      database: "Connection Error",
      userCount: 0,
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Handle 404 for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({ error: "API endpoint not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 User Management API running on http://localhost:${PORT}`);
  console.log(`📊 API Documentation: http://localhost:${PORT}/api/users`);
  console.log(`🌐 Web Interface: http://localhost:${PORT}`);
  console.log(`💾 Database: PostgreSQL (with fallback support)`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down server...");
  pool.end(() => {
    console.log("Database connection pool closed.");
    process.exit(0);
  });
});

module.exports = app;
