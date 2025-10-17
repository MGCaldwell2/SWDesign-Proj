import express from "express";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

// Resolve accounts.json relative to this module so it works no matter where the process was started
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.resolve(__dirname, "accounts.json");

let store = {}; // id -> entry

async function loadStore() {
  try {
    const txt = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(txt || "{}");
    if (parsed && typeof parsed === "object") store = parsed;
  } catch (err) {
    // ignore if file doesn't exist
    store = {};
  }
}

async function persistStore() {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(store, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("Failed to persist accounts.json", err);
    return false;
  }
}

// bootstrap
loadStore();

// List all accounts
router.get("/", (req, res) => {
  const list = Object.values(store);
  res.json(list);
});

// Get single account
router.get("/:id", (req, res) => {
  const id = req.params.id;
  const entry = store[id];
  if (!entry) return res.status(404).json({ error: "Not found" });
  res.json(entry);
});

// Create new account entry
router.post("/", async (req, res) => {
  const body = req.body || {};

  // Basic validation/shape enforcement
  const entry = {
    id: String(Date.now()),
    createdAt: new Date().toISOString(),
    fullName: body.fullName || "",
    address1: body.address1 || "",
    address2: body.address2 || "",
    city: body.city || "",
    state: body.state || "",
    zip: body.zip || "",
    skills: Array.isArray(body.skills) ? body.skills : [],
    preferences: body.preferences || "",
    availability: Array.isArray(body.availability) ? body.availability : []
  };

  store[entry.id] = entry;
  const ok = await persistStore();
  if (!ok) {
    // remove from memory if write failed
    delete store[entry.id];
    return res.status(500).json({ error: "Failed to persist account" });
  }

  res.status(201).json(entry);
});

export default router;
