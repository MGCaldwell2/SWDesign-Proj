import mysql from 'mysql2/promise';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const sslConfig = (
  process.env.SSL_CA && process.env.SSL_CERT && process.env.SSL_KEY
) ? {
  ca: fs.readFileSync(process.env.SSL_CA),
  cert: fs.readFileSync(process.env.SSL_CERT),
  key: fs.readFileSync(process.env.SSL_KEY),
} : null;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  connectionLimit: 10,
  ...(sslConfig && { ssl: sslConfig })
});

export default pool;