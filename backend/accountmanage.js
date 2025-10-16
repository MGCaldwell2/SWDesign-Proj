import express from "express";
import fs from "fs/promises";
import path from "path";

const router = express.Router();

const DATA_FILE = path.resolve(process.cwd(), "backend", "accounts.json");

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
  } catch (err) {
    console.error("Failed to persist accounts.json", err);
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
  await persistStore();

  res.status(201).json(entry);
});

export default router;
