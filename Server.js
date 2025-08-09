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
  try {
    // Remove specialization from destructuring
    const { name, email, password, role, doctorId } = req.body;
    console.log("📥 Incoming signup data:", req.body);

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
      if (err) {
        console.error("❌ Database SELECT error:", err);
        return res.status(500).json({ message: "Database error" });
      }

      if (results.length > 0) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      // Update SQL query to remove specialization
      const sql = `INSERT INTO users (name, email, password, role, doctorId)
                   VALUES (?, ?, ?, ?, ?)`;

      // Update parameters to remove specialization
      db.query(sql, [name, email, hashedPassword, role, role === 'doctor' ? doctorId : null], (err) => {
        if (err) {
          console.error("❌ Database INSERT error:", err);
          return res.status(500).json({ message: "Error creating account" });
        }
        res.status(201).json({ message: "Account created successfully" });
      });
    });
  } catch (error) {
    console.error("❌ Unexpected server error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(5000, () => console.log("🚀 Server running on port 5000"));
