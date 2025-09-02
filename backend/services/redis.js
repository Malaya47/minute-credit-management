const redis = require("redis");

let redisClient;

const initRedis = async () => {
  redisClient = redis.createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
  });

  redisClient.on("error", (err) => console.error("Redis Client Error", err));

  await redisClient.connect();
  console.log("✅ Redis connected successfully");
  return redisClient;
};

const getRedisClient = () => {
  if (!redisClient) {
    throw new Error("Redis client not initialized");
  }
  return redisClient;
};

// Session methods
const setSession = async (userId, sessionData) => {
  const client = getRedisClient();
  return await client.set(`session:${userId}`, JSON.stringify(sessionData));
};

const getSession = async (userId) => {
  const client = getRedisClient();
  const data = await client.get(`session:${userId}`);
  return data ? JSON.parse(data) : null;
};

const deleteSession = async (userId) => {
  const client = getRedisClient();
  return await client.del(`session:${userId}`);
};

const getAllSessions = async () => {
  const client = getRedisClient();
  const keys = await client.keys("session:*");
  const sessions = [];

  for (const key of keys) {
    const data = await client.get(key);
    if (data) {
      sessions.push(JSON.parse(data));
    }
  }

  return sessions;
};

// Utility methods
const flushAll = async () => {
  const client = getRedisClient();
  return await client.flushAll();
};

module.exports = {
  initRedis,
  getRedisClient,
  setSession,
  getSession,
  deleteSession,
  getAllSessions,
  flushAll,
};
