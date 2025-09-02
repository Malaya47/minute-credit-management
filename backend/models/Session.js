const pool = require("../config/database");

class Session {
  static async create(userId) {
    const result = await pool.query(
      "INSERT INTO sessions (user_id, start_time) VALUES ($1, NOW()) RETURNING id",
      [userId]
    );
    return result.rows[0];
  }

  static async end(sessionId, creditsConsumed) {
    const result = await pool.query(
      "UPDATE sessions SET end_time = NOW(), credits_consumed = $1 WHERE id = $2 RETURNING *",
      [creditsConsumed, sessionId]
    );
    return result.rows[0];
  }

  static async findActiveByUserId(userId) {
    const result = await pool.query(
      "SELECT * FROM sessions WHERE user_id = $1 AND end_time IS NULL",
      [userId]
    );
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const result = await pool.query(
      "SELECT * FROM sessions WHERE user_id = $1 ORDER BY start_time DESC",
      [userId]
    );
    return result.rows;
  }
}

module.exports = Session;
