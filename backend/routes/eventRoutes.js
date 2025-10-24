import express from "express";
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
} from "../controllers/eventController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, getAllEvents);
router.get("/:id", authenticateToken, getEventById);
router.post("/", authenticateToken, createEvent);
router.put("/:id", authenticateToken, updateEvent);

export default router;
