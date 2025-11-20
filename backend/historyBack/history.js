import express from "express";
import mysql from "mysql2/promise";

const router = express.Router();

// DATABASE CONNECTION POOL
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Password123-",   // <-- CHANGE THIS
  database: "group_user1"     // <-- CHANGE THIS
});

/* =====================================================
   GET OR CREATE USER
   ===================================================== */
router.post("/get-or-create-user", async (req, res) => {
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
});

/* =====================================================
   ADD VOLUNTEER HISTORY EVENT
   ===================================================== */
router.post("/volunteer-history", async (req, res) => {
  try {
    const { user_id, event_description, hours, status, volunteer_date } = req.body;

    if (!user_id || !event_description || !hours || !volunteer_date) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const [result] = await pool.query(
      `INSERT INTO VolunteerHistory 
       (user_id, event_description, hours, status, volunteer_date)
       VALUES (?, ?, ?, ?, ?)`,
      [user_id, event_description, hours, status, volunteer_date]
    );

    const [log] = await pool.query(
      `SELECT v.*, u.name, u.email, u.phone
       FROM VolunteerHistory v
       JOIN users u ON v.user_id = u.user_id
       WHERE v.log_id = ?`,
      [result.insertId]
    );

    res.json(log[0]);

  } catch (err) {
    console.error("Error adding volunteer history:", err);
    res.status(500).json({ error: "Server error." });
  }
});

/* =====================================================
   GET ALL VOLUNTEER HISTORY LOGS
   ===================================================== */
router.get("/volunteer-history", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT v.*, u.name, u.email, u.phone
       FROM VolunteerHistory v
       JOIN users u ON v.user_id = u.user_id
       ORDER BY v.timestamp DESC`
    );

    res.json(rows);

  } catch (err) {
    console.error("Error fetching volunteer logs:", err);
    res.status(500).json({ error: "Server error." });
  }
});

// ES Module export
export default router;
