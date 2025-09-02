const {
  getRedisClient,
  getSession,
  setSession,
  deleteSession,
} = require("./redis");
const pool = require("../config/database");
const { sendCreditUpdate } = require("./websocket");
const User = require("../models/User");
const Session = require("../models/Session");

const startCreditDeductionService = () => {
  setInterval(async () => {
    try {
      const redisClient = getRedisClient();
      const keys = await redisClient.keys("session:*");

      for (const key of keys) {
        const userId = key.split(":")[1];
        const sessionData = await getSession(userId);
        if (!sessionData) continue;

        const currentTime = Date.now();
        const elapsedSeconds = Math.floor(
          (currentTime - sessionData.startTime) / 1000
        );

        // Check if exactly 6 seconds have passed since last deduction
        const shouldDeduct = elapsedSeconds % 6 === 0 && elapsedSeconds > 0;
        const alreadyDeducted =
          sessionData.lastDeductionTime &&
          Math.floor((currentTime - sessionData.lastDeductionTime) / 1000) < 6;

        if (shouldDeduct && !alreadyDeducted) {
          const newCredits = sessionData.credits - 1;

          console.log(
            `User ${userId} - Credits: ${sessionData.credits} -> ${newCredits} (Elapsed: ${elapsedSeconds}s)`
          );

          if (newCredits <= 0) {
            // Use the actual credits from Redis, not calculation
            await Session.end(sessionData.sessionId, sessionData.credits);
            await User.updateCredits(userId, 0);
            await deleteSession(userId);
            sendCreditUpdate(userId, 0);
            console.log(
              `Session ${sessionData.sessionId} stopped due to insufficient credits`
            );
          } else {
            // Update Redis with new credits
            await setSession(userId, {
              ...sessionData,
              credits: newCredits,
              lastDeductionTime: currentTime,
            });

            // Send WebSocket update
            sendCreditUpdate(userId, newCredits);
          }
        }
      }
    } catch (error) {
      console.error("Credit deduction error:", error);
    }
  }, 1000); // Check every second
};

module.exports = { startCreditDeductionService };
