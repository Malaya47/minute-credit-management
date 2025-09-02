require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const WebSocket = require("ws");
const authRoutes = require("./routes/auth");
const sessionRoutes = require("./routes/sessions");
// const creditRoutes = require("./routes/credits");
const { initRedis } = require("./services/redis");
const { setupWebSocket } = require("./services/websocket");
const { startCreditDeductionService } = require("./services/creditDeduction");

const app = express();
const server = http.createServer(app);

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
// app.use("/api/credits", creditRoutes);

// Initialize services
initRedis().then(() => {
  console.log("Redis connected");
  setupWebSocket(server);
  startCreditDeductionService();
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
