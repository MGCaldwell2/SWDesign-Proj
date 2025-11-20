// controllers/authController.js
import pool from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

function signToken(payload) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not set");
  return jwt.sign(payload, secret, { expiresIn: "2h" });
}

<<<<<<< HEAD
export const register = (req, res) => {
  // Accept either email or username
  const { email, username, password } = req.body;
  const userIdentifier = email || username;

  if (users.find((u) => u.username === userIdentifier)) {
    return res.status(400).json({ message: "User already exists" });
=======
export async function register(req, res) {
  try {
    const { email, password, role } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const [exists] = await pool.query("SELECT id FROM users WHERE email=?", [email]);
    if (exists.length) return res.status(409).json({ message: "Email already registered" });

    const hash = await bcrypt.hash(password, 10);

    // Auto-fill display_name from email local-part; keep within column limit
    const display_name = (email.split("@")[0] || "User").slice(0, 200);
    const safeRole = ["admin", "volunteer", "manager"].includes(role) ? role : "volunteer";

    const [ins] = await pool.query(
      "INSERT INTO users (email, password_hash, display_name, role) VALUES (?,?,?,?)",
      [email, hash, display_name, safeRole]
    );

    const token = signToken({ id: ins.insertId, email, role: safeRole });
    res.status(201).json({ id: ins.insertId, email, display_name, role: safeRole, token });
  } catch (err) {
    console.error("register error:", err);
    res.status(500).json({ message: "Registration failed" });
>>>>>>> f4c1f2b2c5fad91b3d17a12043aafd52f54f412a
  }
}

<<<<<<< HEAD
  const newUser = { username: userIdentifier, password };
  users.push(newUser);
=======
export async function login(req, res) {
  try {
    // accept either {email, password} or legacy {username, password}
    const email = req.body?.email || req.body?.username;
    const { password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: "email and password are required" });
>>>>>>> f4c1f2b2c5fad91b3d17a12043aafd52f54f412a

    const [rows] = await pool.query(
      "SELECT id, email, password_hash, display_name, role FROM users WHERE email=?",
      [email]
    );
    if (!rows.length) return res.status(401).json({ message: "Invalid email or password" });

<<<<<<< HEAD
export const login = (req, res) => {
  // Accept either email or username
  const { email, username, password } = req.body;
  const loginIdentifier = email || username;

  const user = users.find(
    (u) => u.username === loginIdentifier && u.password === password
  );
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
=======
    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: "Invalid email or password" });

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    res.json({ id: user.id, email: user.email, display_name: user.display_name, role: user.role, token });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ message: "Login failed" });
>>>>>>> f4c1f2b2c5fad91b3d17a12043aafd52f54f412a
  }
}
