const WebSocket = require("ws");
const jwt = require("jsonwebtoken");

let wss;

const setupWebSocket = (server) => {
  wss = new WebSocket.Server({ server, path: "/" });

  wss.on("connection", (ws, req) => {
    console.log("WebSocket connection attempt");

    // Extract token from query parameters
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get("token");

    if (!token) {
      console.log("No token provided, closing connection");
      ws.close(1008, "Authentication required");
      return;
    }

    // Verify JWT token
    jwt.verify(token, process.env.JWT_SECRET || "secret", (err, decoded) => {
      if (err) {
        console.log("Invalid token, closing connection:", err.message);
        ws.close(1008, "Invalid token");
        return;
      }

      ws.userId = decoded.userId;
      ws.userEmail = decoded.email;
      console.log(
        `User ${decoded.userId} (${decoded.email}) connected via WebSocket`
      );

      // Send initial credit balance
      sendCreditUpdate(decoded.userId, decoded.credits || 100);
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });

    ws.on("close", () => {
      console.log(`User ${ws.userId} disconnected from WebSocket`);
    });
  });

  console.log("WebSocket server setup complete");
};

// Function to send credit updates to specific user
const sendCreditUpdate = (userId, credits) => {
  if (!wss) {
    console.error("WebSocket server not initialized");
    return;
  }

  let sent = false;
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client.userId == userId) {
      client.send(JSON.stringify({ type: "credit_update", credits }));
      sent = true;
      console.log(
        `📤 Sent WebSocket update to user ${userId}: ${credits} credits`
      );
    }
  });

  if (!sent) {
    console.log(`❌ No connected WebSocket client found for user ${userId}`);
  }
};

module.exports = { setupWebSocket, sendCreditUpdate };
