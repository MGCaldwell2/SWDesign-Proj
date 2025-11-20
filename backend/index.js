import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import accountRouter from "./accountmanage.js";
import volunteermatchingRouter from "./volunteermatching/volunteermatching.js";
import notificationRouter from "./notification/notification.js";
import userRoutes from "./routes/userRoutes.js";
import userControllers from "./controllers/userControllers.js";
import historyRoutes from "./historyBack/history.js";
app.use("/api", historyRoutes); // all endpoints like /api/users/get-or-create and /api/volunteer-history

dotenv.config();

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Routes ---
// Auth and events
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/users", userRoutes);

// Accounts
app.use("/api/accounts", accountRouter);

//import historyRoutes from "./history.js";
//app.use("/api", historyRoutes);


// Volunteer matching and notifications
app.use("/api", volunteermatchingRouter);
app.use("/api", notificationRouter);

// --- Test and root endpoints ---
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from the server 👋" });
});

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// --- Start server ---
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));