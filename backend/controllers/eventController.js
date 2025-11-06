import pool from "../db.js";

// GET ALL EVENTS
export const getAllEvents = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM events ORDER BY date ASC");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ message: "Database fetch failed" });
  }
};

// GET EVENT BY ID
export const getEventById = async (req, res) => {
  try {
    const eventId = req.params.id;
    const [rows] = await pool.query("SELECT * FROM events WHERE id = ?", [eventId]);
    if (rows.length === 0) return res.status(404).json({ message: "Event not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching event:", err);
    res.status(500).json({ message: "Database fetch failed" });
  }
};

// CREATE EVENT
export const createEvent = async (req, res) => {
  try {
    const { name, description, location, date } = req.body;

    const [result] = await pool.query(
    "INSERT INTO events (name, description, location, date) VALUES (?, ?, ?, ?)",
    [name, description, location, date]
    );


    const [newEvent] = await pool.query("SELECT * FROM events WHERE id = ?", [result.insertId]);
    res.status(201).json(newEvent[0]);
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).json({ message: "Database insert failed" });
  }
};

// UPDATE EVENT
export const updateEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const { name, description, location, date, capacity } = req.body;

    const [result] = await pool.query(
      "UPDATE events SET name=?, description=?, location=?, date=?, capacity=? WHERE id=?",
      [name, description, location, date, capacity, eventId]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Event not found" });

    const [updated] = await pool.query("SELECT * FROM events WHERE id=?", [eventId]);
    res.json(updated[0]);
  } catch (err) {
    console.error("Error updating event:", err);
    res.status(500).json({ message: "Database update failed" });
  }
};
