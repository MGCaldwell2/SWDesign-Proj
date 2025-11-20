import pool from "../db.js";

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
