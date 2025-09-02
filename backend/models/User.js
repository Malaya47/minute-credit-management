const pool = require("../config/database");

class User {
  static async create(email, password) {
    const result = await pool.query(
      "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email, credits, created_at",
      [email, password]
    );
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      "SELECT id, email, credits, created_at FROM users WHERE id = $1",
      [id]
    );
    return result.rows[0];
  }

  static async updateCredits(id, credits) {
    const result = await pool.query(
      "UPDATE users SET credits = $1, updated_at = NOW() WHERE id = $2 RETURNING credits",
      [credits, id]
    );
    return result.rows[0];
  }

  static async addCredits(id, amount) {
    const result = await pool.query(
      "UPDATE users SET credits = credits + $1, updated_at = NOW() WHERE id = $2 RETURNING credits",
      [amount, id]
    );
    return result.rows[0];
  }
}

module.exports = User;
