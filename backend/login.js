import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Schema & Model
const volunteerLogSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  description: { type: String, required: true },
  hours: { type: Number, required: true },
  status: {
    type: String,
    enum: ["Completed", "In Progress", "Missed"],
    default: "Completed",
  },
  timestamp: { type: Date, default: Date.now },
});

const VolunteerLog = mongoose.model("VolunteerLog", volunteerLogSchema);

// Routes
app.get("/", (req, res) => res.send("Volunteer Log API is running..."));

// Get all logs
app.get("/api/logs", async (req, res) => {
  try {
    const logs = await VolunteerLog.find().sort({ timestamp: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new log
app.post("/api/logs", async (req, res) => {
  const { name, email, phone, description, hours, status } = req.body;

  if (!name || !email || !description || !hours) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const newLog = new VolunteerLog({
      name,
      email,
      phone,
      description,
      hours,
      status,
    });

    const savedLog = await newLog.save();
    res.status(201).json(savedLog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get logs for a specific volunteer
app.get("/api/logs/:email", async (req, res) => {
  try {
    const logs = await VolunteerLog.find({ email: req.params.email }).sort({
      timestamp: -1,
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
