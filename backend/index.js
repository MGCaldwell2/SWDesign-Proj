import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import accountRouter from "./accountmanage.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from the server 👋" });
});

app.use("/api/accounts", accountRouter);

app.get("/", (req, res) => {
    res.send("Backend is running 🚀");
  });
  
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
