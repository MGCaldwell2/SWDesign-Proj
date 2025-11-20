import pool from "./db.js";

(async () => {
  try {
    await pool.query("SELECT 1");
    console.log("✅ Connected to MySQL");
  } catch (err) {
    console.error("❌ MySQL connection failed:", err);
  }
})();

const TEST_USER_ID = 1;

// Helper to safely parse JSON columns
function safeParseJSON(value, defaultValue = []) {
  if (!value) return defaultValue;
  try {
    return JSON.parse(value);
  } catch {
    return defaultValue;
  }
}

// GET /account
export const getAccount = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM UserProfile WHERE id = ?",
      [TEST_USER_ID]
    );

    if (rows.length === 0) return res.status(404).json({ error: "User not found" });

    const user = rows[0];

    user.skills = safeParseJSON(user.skills);
    user.availability = safeParseJSON(user.availability);

    res.json(user);
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ error: "Database error" });
  }
};

// PUT /account
export const updateAccount = async (req, res) => {
  console.log("Incoming updateAccount request body:", req.body);

  const {
    full_name,
    address1,
    address2,
    city,
    state,
    zipcode,
    skills,
    preferences,
    availability,
  } = req.body;

  try {
    const [existingRows] = await pool.query(
      "SELECT * FROM UserProfile WHERE id = ?",
      [TEST_USER_ID]
    );
    if (existingRows.length === 0) return res.status(404).json({ error: "User not found" });

    const existing = existingRows[0];

    let skillsString, availabilityString;
    try {
      skillsString = JSON.stringify(skills ?? safeParseJSON(existing.skills));
    } catch (jsonErr) {
      console.error("JSON stringify error for skills:", jsonErr);
      return res.status(400).json({ error: "Invalid JSON format for skills", details: jsonErr.message });
    }
    try {
      availabilityString = JSON.stringify(availability ?? safeParseJSON(existing.availability));
    } catch (jsonErr) {
      console.error("JSON stringify error for availability:", jsonErr);
      return res.status(400).json({ error: "Invalid JSON format for availability", details: jsonErr.message });
    }

    const updatedData = {
      full_name: full_name ?? existing.full_name,
      address1: address1 ?? existing.address1,
      address2: address2 ?? existing.address2,
      city: city ?? existing.city,
      state: state ?? existing.state,
      zipcode: zipcode ?? existing.zipcode,
      skills: skillsString,
      preferences: preferences ?? existing.preferences,
      availability: availabilityString,
    };

    console.log("Updating UserProfile with:", updatedData);

    try {
      await pool.query(
        `UPDATE UserProfile 
         SET full_name = ?, 
             address1 = ?, 
             address2 = ?, 
             city = ?, 
             state = ?, 
             zipcode = ?, 
             skills = ?, 
             preferences = ?, 
             availability = ?
         WHERE id = ?`,
        [
          updatedData.full_name,
          updatedData.address1,
          updatedData.address2,
          updatedData.city,
          updatedData.state,
          updatedData.zipcode,
          updatedData.skills,
          updatedData.preferences,
          updatedData.availability,
          TEST_USER_ID,
        ]
      );
    } catch (dbErr) {
      console.error("MySQL update error:", dbErr);
      return res.status(500).json({ error: "Database update failed", details: dbErr.message });
    }

    const [updatedRows] = await pool.query(
      "SELECT * FROM UserProfile WHERE id = ?",
      [TEST_USER_ID]
    );

    const updatedUser = updatedRows[0];
    updatedUser.skills = safeParseJSON(updatedUser.skills);
    updatedUser.availability = safeParseJSON(updatedUser.availability);

    res.json(updatedUser);
  } catch (err) {
    console.error("DB update error:", err);
    res.status(500).json({ error: "Database update failed", details: err.message });
  }
};
export const createAccount = async (req, res) => {
  console.log("Incoming createAccount request body:", req.body);

  const {
    full_name,
    address1,
    address2,
    city,
    state,
    zipcode,
    skills,
    preferences,
    availability,
  } = req.body;

  try {
    const skillsString = JSON.stringify(skills ?? []);
    const availabilityString = JSON.stringify(availability ?? []);

    const [result] = await pool.query(
      `INSERT INTO UserProfile (full_name, address1, address2, city, state, zipcode, skills, preferences, availability)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
      [
        full_name || "",
        address1 || "",
        address2 || "",
        city || "",
        state || "",
        zipcode || "",
        skillsString,
        preferences || "",
        availabilityString,
      ]
    );

    const insertedId = result.insertId;
    const [rows] = await pool.query("SELECT * FROM UserProfile WHERE id = ?", [insertedId]);
    const newUser = rows[0];
    newUser.skills = safeParseJSON(newUser.skills);
    newUser.availability = safeParseJSON(newUser.availability);

    res.status(201).json(newUser);
  } catch (err) {
    console.error("DB insert error:", err);
    res.status(500).json({ error: "Database insert failed", details: err.message });
  }
};

import express from "express";
const router = express.Router();

router.get("/account", getAccount);
router.put("/account", updateAccount);

// For compatibility with older frontend code that might hit /api/accounts
router.get("/", getAccount);
router.post("/", createAccount);

export default router;