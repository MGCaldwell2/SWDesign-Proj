import fs from "fs";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
      ssl: {
        ca: fs.readFileSync("./server-ca.pem"),
        key: fs.readFileSync("./client-key.pem"),
        cert: fs.readFileSync("./client-cert.pem"),
      },
    });

    const [rows] = await connection.query("SELECT NOW() AS now");
    console.log("✅ Connected to MySQL successfully!");
    console.log("Current time from DB:", rows[0].now);
    await connection.end();
  } catch (err) {
    console.error("❌ Connection failed:", err.message);
  }
}

testConnection();