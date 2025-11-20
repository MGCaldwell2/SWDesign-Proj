import pool from "../db.js";

// Get or create a user
export const getOrCreateUser = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required." });
    }

    const [existing] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.json({ user_id: existing[0].user_id });
    }

    const [result] = await pool.query(
      "INSERT INTO users (name, email, phone) VALUES (?, ?, ?)",
      [name, email, phone || null]
    );

    return res.json({ user_id: result.insertId });

  } catch (err) {
    console.error("Error in get-or-create-user:", err);
    res.status(500).json({ error: "Server error." });
  }
};

// Create a volunteer event
export const createEvent = async (req, res) => {
  const { user_id, event_description, hours, status, volunteer_date } = req.body;

  if (!user_id || !event_description || !hours || !status || !volunteer_date) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO VolunteerHistory 
       (user_id, event_description, hours, status, volunteer_date) 
       VALUES (?, ?, ?, ?, ?)`,
      [user_id, event_description, hours, status, volunteer_date]
    );

    const [newRows] = await pool.query(
      "SELECT * FROM VolunteerHistory WHERE log_id = ?",
      [result.insertId]
    );

    res.json(newRows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
};

// Get all volunteer events (join with user info)
export const getAllEvents = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT vh.*, u.name, u.email, u.phone
      FROM VolunteerHistory vh
      JOIN users u ON vh.user_id = u.user_id
      ORDER BY vh.timestamp ASC
    `);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
};
