import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import accountRouter from "./accountmanage.js";
import volunteermatchingRouter from "./volunteermatching/volunteermatching.js";
import notificationRouter from "./notification/notification.js";

dotenv.config();
const app = express();

// CORS before routes
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
// no app.options("*", cors()) on Express 5

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api", volunteermatchingRouter);
app.use("/api", notificationRouter);
app.use("/api/accounts", accountRouter);

// Hello + root
app.get("/api/hello", (req, res) => res.json({ message: "Hello from the server 👋" }));
app.get("/", (_req, res) => res.send("Backend is running 🚀"));

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
