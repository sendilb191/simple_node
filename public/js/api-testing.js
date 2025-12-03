// API Testing Functions

// Test GET /api/users endpoint
async function testGetUsers() {
  const resultDiv = document.getElementById("getTestResult");
  resultDiv.style.display = "block";
  resultDiv.textContent = "Testing GET /api/users...";
  resultDiv.className = "test-result";

  try {
    const startTime = Date.now();
    const response = await fetch(`${API_BASE}/users`);
    const endTime = Date.now();
    const data = await response.json();

    const result = {
      status: response.status,
      statusText: response.statusText,
      responseTime: `${endTime - startTime}ms`,
      headers: {
        "content-type": response.headers.get("content-type"),
        "content-length": response.headers.get("content-length"),
      },
      body: data,
    };

    resultDiv.textContent =
      `✅ SUCCESS (${response.status})\n\n` +
      `Response Time: ${result.responseTime}\n` +
      `Content-Type: ${result.headers["content-type"]}\n\n` +
      `Response Body:\n${JSON.stringify(data, null, 2)}`;
    resultDiv.className = "test-result success";
  } catch (error) {
    resultDiv.textContent = `❌ ERROR\n\n${error.message}`;
    resultDiv.className = "test-result error";
  }
}

// Test GET /api/health endpoint
async function testHealthCheck() {
  const resultDiv = document.getElementById("getTestResult");
  resultDiv.style.display = "block";
  resultDiv.textContent = "Testing GET /api/health...";
  resultDiv.className = "test-result";

  try {
    const startTime = Date.now();
    const response = await fetch(`${API_BASE}/health`);
    const endTime = Date.now();
    const data = await response.json();

    resultDiv.textContent =
      `✅ SUCCESS (${response.status})\n\n` +
      `Response Time: ${endTime - startTime}ms\n\n` +
      `Response Body:\n${JSON.stringify(data, null, 2)}`;
    resultDiv.className = "test-result success";
  } catch (error) {
    resultDiv.textContent = `❌ ERROR\n\n${error.message}`;
    resultDiv.className = "test-result error";
  }
}

// Test POST /api/users endpoint
async function testPostUser() {
  const resultDiv = document.getElementById("postTestResult");
  const nameInput = document.getElementById("testUserName");

  if (!nameInput.value.trim()) {
    alert("Please enter a name for the test user");
    return;
  }

  resultDiv.style.display = "block";
  resultDiv.textContent = "Testing POST /api/users...";
  resultDiv.className = "test-result";

  try {
    const startTime = Date.now();
    const response = await fetch(`${API_BASE}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: nameInput.value.trim() }),
    });
    const endTime = Date.now();
    const data = await response.json();

    const result =
      `✅ SUCCESS (${response.status})\n\n` +
      `Response Time: ${endTime - startTime}ms\n` +
      `Request Body: ${JSON.stringify(
        { name: nameInput.value.trim() },
        null,
        2
      )}\n\n` +
      `Response Body:\n${JSON.stringify(data, null, 2)}`;

    resultDiv.textContent = result;
    resultDiv.className = "test-result success";

    // Refresh users list and clear input
    loadUsers();
    nameInput.value = "";
  } catch (error) {
    resultDiv.textContent = `❌ ERROR\n\n${error.message}`;
    resultDiv.className = "test-result error";
  }
}

// Test DELETE /api/users/:id endpoint
async function testDeleteUser() {
  const resultDiv = document.getElementById("deleteTestResult");
  const idInput = document.getElementById("testDeleteId");

  if (!idInput.value) {
    alert("Please enter a user ID to delete");
    return;
  }

  const userId = parseInt(idInput.value);
  const user = users.find((u) => u.id === userId);

  if (!user) {
    alert(
      `User with ID ${userId} not found. Please check the user list above.`
    );
    return;
  }

  if (!confirm(`Delete user "${user.name}" (ID: ${userId})?`)) {
    return;
  }

  resultDiv.style.display = "block";
  resultDiv.textContent = `Testing DELETE /api/users/${userId}...`;
  resultDiv.className = "test-result";

  try {
    const startTime = Date.now();
    const response = await fetch(`${API_BASE}/users/${userId}`, {
      method: "DELETE",
    });
    const endTime = Date.now();
    const data = await response.json();

    const result =
      `✅ SUCCESS (${response.status})\n\n` +
      `Response Time: ${endTime - startTime}ms\n` +
      `Deleted User: ${user.name} (ID: ${userId})\n\n` +
      `Response Body:\n${JSON.stringify(data, null, 2)}`;

    resultDiv.textContent = result;
    resultDiv.className = "test-result success";

    // Refresh users list and clear input
    loadUsers();
    idInput.value = "";
  } catch (error) {
    resultDiv.textContent = `❌ ERROR\n\n${error.message}`;
    resultDiv.className = "test-result error";
  }
}

// Test custom endpoints
async function testCustomEndpoint() {
  const resultDiv = document.getElementById("customTestResult");
  const methodSelect = document.getElementById("testMethod");
  const endpointInput = document.getElementById("testEndpoint");
  const payloadInput = document.getElementById("testPayload");

  if (!endpointInput.value.trim()) {
    alert("Please enter an endpoint to test");
    return;
  }

  const method = methodSelect.value;
  const endpoint = endpointInput.value.trim();
  let payload = null;

  // Parse payload for POST/PUT requests
  if ((method === "POST" || method === "PUT") && payloadInput.value.trim()) {
    try {
      payload = JSON.parse(payloadInput.value.trim());
    } catch (error) {
      alert("Invalid JSON in payload. Please check your syntax.");
      return;
    }
  }

  resultDiv.style.display = "block";
  resultDiv.textContent = `Testing ${method} ${endpoint}...`;
  resultDiv.className = "test-result";

  try {
    const startTime = Date.now();
    const options = {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (payload) {
      options.body = JSON.stringify(payload);
    }

    const response = await fetch(endpoint, options);
    const endTime = Date.now();

    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    let result =
      `${response.ok ? "✅ SUCCESS" : "❌ FAILED"} (${response.status} ${
        response.statusText
      })\n\n` +
      `Response Time: ${endTime - startTime}ms\n` +
      `Content-Type: ${contentType}\n`;

    if (payload) {
      result += `\nRequest Body:\n${JSON.stringify(payload, null, 2)}\n`;
    }

    result += `\nResponse Body:\n`;
    if (typeof data === "string") {
      result += data;
    } else {
      result += JSON.stringify(data, null, 2);
    }

    resultDiv.textContent = result;
    resultDiv.className = response.ok
      ? "test-result success"
      : "test-result error";

    // Refresh users if this was a user-related operation
    if (endpoint.includes("/users")) {
      loadUsers();
    }
  } catch (error) {
    resultDiv.textContent = `❌ ERROR\n\n${error.message}`;
    resultDiv.className = "test-result error";
  }
}
