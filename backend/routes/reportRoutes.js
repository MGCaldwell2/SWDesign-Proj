// backend/routes/reportRoutes.js
import express from "express";
import {
  getVolunteerReport,
  getEventReport,
} from "../controllers/reportController.js";

const router = express.Router();

// Base path is /api/reports (set in index.js)
router.get("/volunteers", getVolunteerReport);
router.get("/events", getEventReport);

export default router;