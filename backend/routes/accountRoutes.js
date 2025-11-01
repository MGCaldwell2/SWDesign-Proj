import express from "express";
import { getAccount, updateAccount } from "../controllers/accountmanage.js";

const router = express.Router();

router.get("/account", getAccount);
router.put("/account", updateAccount);

export default router;