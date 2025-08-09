import express from "express";
import mysql from "mysql2";
import bcrypt from "bcryptjs";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// MySQL Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) {
    console.error("MySQL connection error:", err);
  } else {
    console.log("✅ Connected to MySQL");
  }
});

// Signup endpoint
app.post("/api/signup", async (req, res) => {
  const { name, email, password, role, doctorId, specialization } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Check if email already exists
  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (results.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const sql = `
      INSERT INTO users (name, email, password, role, doctorId, specialization)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.query(sql, [name, email, hashedPassword, role, doctorId || null, specialization || null], (err) => {
      if (err) return res.status(500).json({ message: "Error creating account" });
      res.status(201).json({ message: "Account created successfully" });
    });
  });
});

app.listen(5000, () => console.log("🚀 Server running on port 5000"));
