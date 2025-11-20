import pool from "../db.js"; // make sure db.js uses ES Modules

// Create or get user
export const getOrCreateUser = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required." });
    }

    // Look for existing user
    const [existing] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.json({ user_id: existing[0].user_id });
    }

    // Create new user
    const [result] = await pool.query(
      "INSERT INTO users (name, email, phone) VALUES (?, ?, ?)",
      [name, email, phone || null]
    );

    res.json({ user_id: result.insertId });

  } catch (err) {
    console.error("Error in getOrCreateUser:", err);
    res.status(500).json({ error: "Server error" });
  }
};
