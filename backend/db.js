import mysql from "mysql2/promise";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const pool = mysql.createPool({
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
  connectionLimit: 10,
});

export default pool;
