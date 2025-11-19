// routes/eventRoutes.js
import express from "express";
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../controllers/eventController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public reads
router.get("/", getAllEvents);
router.get("/:id", getEventById);

// Protected writes
router.post("/", authenticateToken, createEvent);
router.put("/:id", authenticateToken, updateEvent);
router.delete("/:id", authenticateToken, deleteEvent);

export default router;
