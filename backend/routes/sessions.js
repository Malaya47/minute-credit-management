const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const pool = require("../config/database");
const { setSession, getSession, deleteSession } = require("../services/redis");
const User = require("../models/User");
const Session = require("../models/Session");

const router = express.Router();

// Start session
router.post("/start", authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    // Check if user already has an active session
    const activeSession = await getSession(userId);
    if (activeSession) {
      return res.status(400).json({ error: "Session already active" });
    }

    // Check user credits and get fresh value
    const user = await User.findById(userId);
    if (!user || user.credits <= 0) {
      return res.status(400).json({ error: "Insufficient credits" });
    }

    // Create session in database
    const session = await Session.create(userId);
    const sessionId = session.id;

    // Store active session in Redis with fresh credits and initial state
    await setSession(userId, {
      sessionId: sessionId,
      userId: userId,
      startTime: Date.now(),
      credits: user.credits,
      intervalsDeducted: 0, // Track how many deductions we've made
      lastDeductionTime: null, // When we last deducted credits
    });

    console.log(
      `Session ${sessionId} started for user ${userId} with ${user.credits} credits`
    );

    res.json({ message: "Session started", sessionId });
  } catch (error) {
    console.error("Start session error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Stop session
router.post("/stop", authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    // Check if user has an active session
    const activeSession = await getSession(userId);
    if (!activeSession) {
      return res.status(400).json({ error: "No active session" });
    }

    // Use the CURRENT credits from Redis, not calculate from time
    const endTime = Date.now();
    const elapsedSeconds = Math.floor(
      (endTime - activeSession.startTime) / 1000
    );
    const creditsConsumed = Math.floor(elapsedSeconds / 6);

    // Get the ACTUAL current credits from Redis
    const currentCredits = activeSession.credits;

    // Update session in database
    await Session.end(activeSession.sessionId, creditsConsumed);

    // Update user credits with the ACTUAL current value from Redis
    await User.updateCredits(userId, currentCredits);

    // Remove session from Redis
    await deleteSession(userId);

    res.json({
      message: "Session stopped",
      creditsConsumed,
      finalCredits: currentCredits,
    });
  } catch (error) {
    console.error("Stop session error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Check active session
router.get("/active", authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    const activeSession = await getSession(userId);
    res.json({ active: !!activeSession });
  } catch (error) {
    console.error("Check active session error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get current credits (including active session credits)
router.get("/credits", authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    // Check if user has an active session in Redis
    const activeSession = await getSession(userId);

    if (activeSession) {
      // Return the current credits from Redis session
      res.json({ credits: activeSession.credits });
    } else {
      // Return credits from database
      const user = await User.findById(userId);
      res.json({ credits: user.credits });
    }
  } catch (error) {
    console.error("Get credits error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
