const express = require("express");
const fs = require("fs");
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

// In-memory database simulation with file persistence
const dbPath = path.join(__dirname, "users.json");
let users = [];
let nextId = 1;

// Load users from file if it exists
function loadUsers() {
  try {
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, "utf8");
      const parsed = JSON.parse(data);
      users = parsed.users || [];
      nextId = parsed.nextId || 1;
      console.log(`Loaded ${users.length} users from database`);

      // If database exists but is empty, add sample users
      if (users.length === 0) {
        createSampleUsers();
      }
    } else {
      // Database doesn't exist, create sample data
      createSampleUsers();
    }
  } catch (error) {
    console.error("Error loading users:", error);
    users = [];
    nextId = 1;
    createSampleUsers();
  }
}

// Create sample users
function createSampleUsers() {
  users = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      age: 30,
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      age: 25,
      created_at: new Date().toISOString(),
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike@example.com",
      age: 35,
      created_at: new Date().toISOString(),
    },
  ];
  nextId = 4;
  saveUsers();
  console.log("Created sample users");
}

// Save users to file
function saveUsers() {
  try {
    const data = { users, nextId };
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error saving users:", error);
  }
}

// Initialize database
loadUsers();

// Helper function to find user by ID
function findUserById(id) {
  return users.find((user) => user.id === parseInt(id));
}

// Helper function to find user by email
function findUserByEmail(email) {
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

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
app.get("/api/users", (req, res) => {
  try {
    // Sort by created_at descending
    const sortedUsers = [...users].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
    res.json({ success: true, users: sortedUsers, count: sortedUsers.length });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Get user by ID
app.get("/api/users/:id", (req, res) => {
  try {
    const user = findUserById(req.params.id);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({ success: true, user: user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Create new user
app.post("/api/users", (req, res) => {
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

  // Check if email already exists
  if (findUserByEmail(email)) {
    res.status(400).json({ error: "Email already exists" });
    return;
  }

  try {
    const newUser = {
      id: nextId++,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      age: age ? parseInt(age) : null,
      created_at: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers();

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// Update user
app.put("/api/users/:id", (req, res) => {
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
    const userIndex = users.findIndex(
      (user) => user.id === parseInt(req.params.id)
    );

    if (userIndex === -1) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Check if email already exists (excluding current user)
    const existingUser = findUserByEmail(email);
    if (existingUser && existingUser.id !== parseInt(req.params.id)) {
      res.status(400).json({ error: "Email already exists" });
      return;
    }

    // Update user
    users[userIndex] = {
      ...users[userIndex],
      name: name.trim(),
      email: email.trim().toLowerCase(),
      age: age ? parseInt(age) : null,
    };

    saveUsers();

    res.json({
      success: true,
      message: "User updated successfully",
      user: users[userIndex],
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// Delete user
app.delete("/api/users/:id", (req, res) => {
  try {
    const userIndex = users.findIndex(
      (user) => user.id === parseInt(req.params.id)
    );

    if (userIndex === -1) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    users.splice(userIndex, 1);
    saveUsers();

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    userCount: users.length,
  });
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
  console.log(`💾 Database: ${users.length} users loaded`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down server...");
  saveUsers();
  console.log("Data saved successfully.");
  process.exit(0);
});

module.exports = app;
