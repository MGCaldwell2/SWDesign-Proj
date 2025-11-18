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
    const eventId = Number(req.params.id);
    if (!Number.isInteger(eventId)) return res.status(400).json({ message: "Invalid event id" });

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
    let { name, description, location, date, capacity } = req.body || {};

    name = typeof name === "string" ? name.trim() : "";
    description = typeof description === "string" ? description.trim() : "";
    location = typeof location === "string" ? location.trim() : "";
    date = date && String(date).trim() !== "" ? date : null;

    if (capacity === "" || capacity === undefined || capacity === null) {
      capacity = null;
    } else {
      const n = Number(capacity);
      if (!Number.isFinite(n)) return res.status(400).json({ message: "capacity must be a number or null" });
      capacity = n;
    }

    if (!name || !description || !location) {
      return res.status(400).json({ message: "name, description, location are required" });
    }

    const [result] = await pool.query(
      "INSERT INTO events (name, description, location, date, capacity) VALUES (?, ?, ?, ?, ?)",
      [name, description, location, date, capacity]
    );

    const [newEvent] = await pool.query("SELECT * FROM events WHERE id = ?", [result.insertId]);
    res.status(201).json(newEvent[0]);
  } catch (err) {
    console.error("❌ Error creating event:", err);
    res.status(500).json({ message: "Database insert failed" });
  }
};

// UPDATE EVENT
export const updateEvent = async (req, res) => {
  try {
    const eventId = Number(req.params.id);
    if (!Number.isInteger(eventId)) return res.status(400).json({ message: "Invalid event id" });

    let { name, description, location, date, capacity } = req.body || {};

    name = typeof name === "string" ? name.trim() : "";
    description = typeof description === "string" ? description.trim() : "";
    location = typeof location === "string" ? location.trim() : "";
    date = date && String(date).trim() !== "" ? date : null;

    if (capacity === "" || capacity === undefined || capacity === null) {
      capacity = null;
    } else {
      const n = Number(capacity);
      if (!Number.isFinite(n)) return res.status(400).json({ message: "capacity must be a number or null" });
      capacity = n;
    }

    if (!name || !description || !location) {
      return res.status(400).json({ message: "name, description, location are required" });
    }

    const [result] = await pool.query(
      "UPDATE events SET name=?, description=?, location=?, date=?, capacity=? WHERE id=?",
      [name, description, location, date, capacity, eventId]
    );

    if (result.affectedRows === 0) return res.status(404).json({ message: "Event not found" });

    const [updated] = await pool.query("SELECT * FROM events WHERE id=?", [eventId]);
    res.json(updated[0]);
  } catch (err) {
    console.error("❌ Database update failed:", err); // see exact MySQL error in server logs
    res.status(500).json({ message: "Database update failed" });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const eventId = Number(req.params.id);
    if (!Number.isInteger(eventId)) return res.status(400).json({ message: "Invalid event id" });

    const [result] = await pool.query("DELETE FROM events WHERE id = ?", [eventId]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Event not found" });

    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting event:", err);
    res.status(500).json({ message: "Database delete failed" });
  }
};
