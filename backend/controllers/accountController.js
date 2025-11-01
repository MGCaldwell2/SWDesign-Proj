import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const TEST_USER_ID = 1;

// Test MySQL connection
(async () => {
  try {
    await pool.query("SELECT 1");
    console.log("✅ AccountController: Connected to MySQL");
  } catch (err) {
    console.error("❌ AccountController: MySQL connection failed:", err.message || err);
  }
})();

// Safe JSON parse
function safeParseJSON(value, defaultValue = []) {
  if (!value) return defaultValue;
  try {
    return JSON.parse(value);
  } catch {
    return defaultValue;
  }
}

// GET /account → fetch profile
export const getAccount = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM UserProfile WHERE id = ?", [TEST_USER_ID]);
    if (rows.length === 0) return res.status(404).json({ error: "User not found" });

    // Ensure JSON columns are parsed
    const user = rows[0];
    user.skills = safeParseJSON(user.skills);
    user.availability = safeParseJSON(user.availability);

    res.json(user);
  } catch (err) {
    console.error("DB error in getAccount:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
};

// PUT /account → update profile
export const updateAccount = async (req, res) => {
  console.log("PUT /account body:", req.body);

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
  } = req.body || {}; // prevent crash if req.body is undefined

  try {
    const [existingRows] = await pool.query("SELECT * FROM UserProfile WHERE id = ?", [TEST_USER_ID]);
    if (existingRows.length === 0) return res.status(404).json({ error: "User not found" });

    const existing = existingRows[0];

    const safeSkills = JSON.stringify(skills ?? safeParseJSON(existing.skills));
    const safeAvailability = JSON.stringify(availability ?? safeParseJSON(existing.availability));

    await pool.query(
      `UPDATE UserProfile 
       SET full_name=?, address1=?, address2=?, city=?, state=?, zipcode=?, skills=?, preferences=?, availability=?
       WHERE id=?`,
      [
        full_name ?? existing.full_name,
        address1 ?? existing.address1,
        address2 ?? existing.address2,
        city ?? existing.city,
        state ?? existing.state,
        zipcode ?? existing.zipcode,
        safeSkills,
        preferences ?? existing.preferences,
        safeAvailability,
        TEST_USER_ID,
      ]
    );

    const [updatedRows] = await pool.query("SELECT * FROM UserProfile WHERE id = ?", [TEST_USER_ID]);
    const updatedUser = updatedRows[0];
    updatedUser.skills = safeParseJSON(updatedUser.skills);
    updatedUser.availability = safeParseJSON(updatedUser.availability);

    res.json(updatedUser);
  } catch (err) {
    console.error("DB update error in updateAccount:", err);
    res.status(500).json({ error: "Database update failed", details: err.message });
  }
};