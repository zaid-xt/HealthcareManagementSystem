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

// Login endpoint
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) {
      console.error("Database SELECT error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = results[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // You can optionally exclude the password from the response
    const { password: pwd, ...userWithoutPassword } = user;

    res.status(200).json({ message: "Login successful", user: userWithoutPassword });
  });
});

// Update profile endpoint
app.put("/api/profile", async (req, res) => {
  try {
    const { id, name, email, doctorId } = req.body;

    if (!id || !name || !email) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // For doctors, require doctorId
    if (req.body.role === 'doctor' && !doctorId) {
      return res.status(400).json({ message: "Doctor ID is required" });
    }

    const sql = `UPDATE users 
                 SET name = ?, email = ?, doctorId = ?
                 WHERE id = ?`;
    
    db.query(sql, [name, email, doctorId || null, id], (err, results) => {
      if (err) {
        console.error("❌ Database UPDATE error:", err);
        return res.status(500).json({ message: "Error updating profile" });
      }
      
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(200).json({ message: "Profile updated successfully" });
    });
  } catch (error) {
    console.error("❌ Unexpected server error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete profile endpoint
app.delete("/api/profile/:id", (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    db.query("DELETE FROM users WHERE id = ?", [userId], (err, results) => {
      if (err) {
        console.error("❌ Database DELETE error:", err);
        return res.status(500).json({ message: "Error deleting profile" });
      }
      
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(200).json({ message: "Profile deleted successfully" });
    });
  } catch (error) {
    console.error("❌ Unexpected server error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
function toMySQLDateTime(isoString) {
  if (!isoString) return null;
  const d = new Date(isoString);
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

// ... your existing imports and setup

const serializeSymptoms = (symptoms) => JSON.stringify(symptoms);
const deserializeSymptoms = (str) => {
  try {
    return JSON.parse(str);
  } catch {
    return [];
  }
};

// GET all medical records
app.get('/api/medical-records', (req, res) => {
  const sql = 'SELECT * FROM medical_records';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('DB error fetching records:', err);
      return res.status(500).json({ message: 'Failed to fetch records' });
    }

    const records = results.map(r => ({
      ...r,
      symptoms: deserializeSymptoms(r.symptoms),
    }));

    res.json(records);
  });
});

// POST create new medical record
app.post('/api/medical-records', (req, res) => {
console.log('POST /api/medical-records body:', req.body);
  const {
    patientId,
    doctorId,
    diagnosis,
    symptoms,
    treatment,
    notes,
    date,
    lastUpdated,
    lastUpdatedBy,
  } = req.body;

  if (!patientId || !doctorId || !diagnosis) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const sql = `
    INSERT INTO medical_records
    (patientId, doctorId, diagnosis, symptoms, treatment, notes, date, lastUpdated, lastUpdatedBy)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      patientId,
      doctorId,
      diagnosis,
      serializeSymptoms(symptoms || []),
      treatment || '',
      notes || '',
     toMySQLDateTime(date) || toMySQLDateTime(new Date().toISOString()),
     toMySQLDateTime(lastUpdated) || toMySQLDateTime(new Date().toISOString()),
      lastUpdatedBy || '',
    ],
    (err, results) => {
      if (err) {
        console.error('DB error inserting record:', err);
        return res.status(500).json({ message: 'Failed to add record' });
      }
      res.status(201).json({ id: results.insertId, ...req.body });
    }
  );
});

app.put('/api/medical-records/:id', (req, res) => {
  const id = req.params.id;
  const {
    patientId,
    doctorId,
    diagnosis,
    symptoms,
    treatment,
    notes,
    date,
    lastUpdated,
    lastUpdatedBy,
  } = req.body;

  if (!patientId || !doctorId || !diagnosis) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const mysqlDate = toMySQLDateTime(date) || toMySQLDateTime(new Date().toISOString());
  const mysqlLastUpdated = toMySQLDateTime(lastUpdated) || mysqlDate;

  const sql = `
    UPDATE medical_records
    SET patientId = ?, doctorId = ?, diagnosis = ?, symptoms = ?, treatment = ?, notes = ?, date = ?, lastUpdated = ?, lastUpdatedBy = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      patientId,
      doctorId,
      diagnosis,
      JSON.stringify(symptoms || []),
      treatment || '',
      notes || '',
      mysqlDate,
      mysqlLastUpdated,
      lastUpdatedBy || '',
      id,
    ],
    (err, results) => {
      if (err) {
        console.error('DB error updating record:', err);
        return res.status(500).json({ message: 'Failed to update record' });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'Record not found' });
      }
      res.json({ message: 'Record updated' });
    }
  );
});

// DELETE medical record by id
app.delete('/api/medical-records/:id', (req, res) => {
  const id = req.params.id;
  const sql = 'DELETE FROM medical_records WHERE id = ?';

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('DB error deleting record:', err);
      return res.status(500).json({ message: 'Failed to delete record' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Record not found' });
    }
    res.json({ message: 'Record deleted' });
  });
});


app.listen(5000, () => console.log("🚀 Server running on port 5000"));
