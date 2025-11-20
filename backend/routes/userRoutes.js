import express from "express";
import { getOrCreateUser } from "../controllers/userController.js";

const router = express.Router();

router.post("/get-or-create", getOrCreateUser);

export default router;  // <-- THIS is required
