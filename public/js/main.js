// User Management System - Main JavaScript

const API_BASE = "/api";
let users = [];

// DOM Elements
const userForm = document.getElementById("userForm");
const editUserForm = document.getElementById("editUserForm");
const usersContainer = document.getElementById("usersContainer");
const messageDiv = document.getElementById("message");
const totalUsersSpan = document.getElementById("totalUsers");
const apiStatusSpan = document.getElementById("apiStatus");
const editModal = document.getElementById("editModal");
const closeModal = document.querySelector(".close");

// Initialize app
document.addEventListener("DOMContentLoaded", function () {
  loadUsers();
  checkApiStatus();
  setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
  userForm.addEventListener("submit", handleAddUser);
  editUserForm.addEventListener("submit", handleEditUser);
  closeModal.addEventListener("click", closeEditModal);
  window.addEventListener("click", function (event) {
    if (event.target === editModal) {
      closeEditModal();
    }
  });
}

// API Status Check
async function checkApiStatus() {
  try {
    const response = await fetch(`${API_BASE}/health`);
    const data = await response.json();
    apiStatusSpan.textContent = data.success ? "✅" : "❌";

    // Update database status information
    if (data.database) {
      document.getElementById("dbStatus").textContent = data.database.connected
        ? "🟢 Connected"
        : "🔴 Disconnected";
      document.getElementById("dbType").textContent =
        data.database.type || "Unknown";
      document.getElementById("dbLastUpdated").textContent =
        new Date().toLocaleString();

      // Update database status text
      document.getElementById("dbStatusText").textContent = "Database Status";
    } else {
      document.getElementById("dbStatus").textContent = "🟡 Unknown";
      document.getElementById("dbType").textContent = "Unknown";
      document.getElementById("dbLastUpdated").textContent = "Unknown";
    }
  } catch (error) {
    apiStatusSpan.textContent = "❌";
    document.getElementById("dbStatus").textContent = "🔴 Error";
    document.getElementById("dbType").textContent = "Error";
    document.getElementById("dbLastUpdated").textContent = "Error";
    console.error("API health check failed:", error);
  }
}

// Show message
function showMessage(message, type = "success") {
  messageDiv.textContent = message;
  messageDiv.className = `message ${type}`;
  messageDiv.style.display = "block";

  // Auto-hide after 5 seconds
  setTimeout(() => {
    messageDiv.style.display = "none";
  }, 5000);
}

// Load users from API
async function loadUsers() {
  try {
    usersContainer.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
        <p>Loading users...</p>
      </div>
    `;

    const response = await fetch(`${API_BASE}/users`);
    const data = await response.json();

    if (data.success) {
      users = data.users;
      displayUsers(users);
      updateStats();
    } else {
      throw new Error(data.error || "Failed to load users");
    }
  } catch (error) {
    console.error("Error loading users:", error);
    usersContainer.innerHTML = `
      <div class="message error">
        <p>❌ Failed to load users: ${error.message}</p>
        <button onclick="loadUsers()" class="btn" style="margin-top: 10px;">Try Again</button>
      </div>
    `;
  }
}

// Display users
function displayUsers(userList) {
  if (userList.length === 0) {
    usersContainer.innerHTML = `
      <div class="message" style="background-color: #e3f2fd; color: #1976d2; border-left-color: #2196f3;">
        <p>📝 No users found. Add your first user above!</p>
      </div>
    `;
    return;
  }

  const usersHTML = userList
    .map(
      (user) => `
        <div class="user-card" data-user-id="${user.id}">
          <h3>${escapeHtml(user.name)}</h3>
          <p><strong>📅 Created:</strong> ${new Date(
            user.created_at
          ).toLocaleDateString()}</p>
          <div class="actions">
            <button onclick="editUser(${
              user.id
            })" class="btn btn-small">✏️ Edit</button>
            <button onclick="deleteUser(${
              user.id
            })" class="btn btn-small btn-danger">🗑️ Delete</button>
          </div>
        </div>
      `
    )
    .join("");

  usersContainer.innerHTML = `<div class="users-grid">${usersHTML}</div>`;
}

// Update statistics
function updateStats() {
  totalUsersSpan.textContent = users.length;
  // Update database records count
  document.getElementById("dbRecords").textContent = users.length.toString();
  // Update last operation
  document.getElementById("lastOperation").textContent = "Load Users";
}

// Handle add user form
async function handleAddUser(event) {
  event.preventDefault();

  const submitBtn = document.getElementById("submitBtn");
  const submitText = document.getElementById("submitText");
  const originalText = submitText.textContent;

  // Show loading state
  submitBtn.disabled = true;
  submitText.textContent = "Adding...";

  try {
    const formData = new FormData(userForm);
    const userData = {
      name: formData.get("name").trim(),
    };

    const response = await fetch(`${API_BASE}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (data.success) {
      showMessage(`✅ User "${userData.name}" added successfully!`, "success");
      userForm.reset();
      loadUsers(); // Refresh the user list
      document.getElementById("lastOperation").textContent = "Add User";
    } else {
      throw new Error(data.error || "Failed to add user");
    }
  } catch (error) {
    console.error("Error adding user:", error);
    showMessage(`❌ Error: ${error.message}`, "error");
  } finally {
    // Reset button state
    submitBtn.disabled = false;
    submitText.textContent = originalText;
  }
}

// Edit user
function editUser(userId) {
  const user = users.find((u) => u.id === userId);
  if (!user) {
    showMessage("❌ User not found", "error");
    return;
  }

  document.getElementById("editUserId").value = user.id;
  document.getElementById("editName").value = user.name;

  editModal.style.display = "block";
}

// Handle edit user form
async function handleEditUser(event) {
  event.preventDefault();

  const userId = document.getElementById("editUserId").value;
  const userData = {
    name: document.getElementById("editName").value.trim(),
  };

  try {
    const response = await fetch(`${API_BASE}/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (data.success) {
      showMessage(
        `✅ User "${userData.name}" updated successfully!`,
        "success"
      );
      closeEditModal();
      loadUsers(); // Refresh the user list
      document.getElementById("lastOperation").textContent = "Update User";
    } else {
      throw new Error(data.error || "Failed to update user");
    }
  } catch (error) {
    console.error("Error updating user:", error);
    showMessage(`❌ Error: ${error.message}`, "error");
  }
}

// Delete user
async function deleteUser(userId) {
  const user = users.find((u) => u.id === userId);
  if (!user) {
    showMessage("❌ User not found", "error");
    return;
  }

  if (!confirm(`Are you sure you want to delete user "${user.name}"?`)) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/users/${userId}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (data.success) {
      showMessage(`✅ User "${user.name}" deleted successfully!`, "success");
      loadUsers(); // Refresh the user list
      document.getElementById("lastOperation").textContent = "Delete User";
    } else {
      throw new Error(data.error || "Failed to delete user");
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    showMessage(`❌ Error: ${error.message}`, "error");
  }
}

// Close edit modal
function closeEditModal() {
  editModal.style.display = "none";
  editUserForm.reset();
}

// Utility function to escape HTML
function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, function (m) {
    return map[m];
  });
}
