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
    const { name, email, password, role, doctorId, idNumber, contactNumber } = req.body;
    console.log("📥 Incoming signup data:", req.body);

    if (!name || !email || !password || !idNumber || !contactNumber) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!/^\d{13}$/.test(idNumber)) {
      return res.status(400).json({ message: "ID Number must be exactly 13 digits" });
    }

    if (!/^\d{10}$/.test(contactNumber)) {
      return res.status(400).json({ message: "Contact Number must be exactly 10 digits" });
    }

    db.query("SELECT * FROM users WHERE email = ?", [email], (err, emailResults) => {
      if (err) {
        console.error("❌ Database SELECT error:", err);
        return res.status(500).json({ message: "Database error" });
      }
      if (emailResults.length > 0) {
        return res.status(400).json({ message: "Email already registered" });
      }

      db.query("SELECT * FROM users WHERE idNumber = ?", [idNumber], async (err, idResults) => {
        if (err) {
          console.error("❌ Database SELECT error:", err);
          return res.status(500).json({ message: "Database error" });
        }
        if (idResults.length > 0) {
          return res.status(400).json({ message: "ID Number already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = `INSERT INTO users (name, email, password, role, doctorId, idNumber, contactNumber)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`;

        db.query(sql,
          [
            name,
            email,
            hashedPassword,
            role,
            role === 'doctor' ? doctorId : null,
            idNumber,
            contactNumber
          ],
          (err) => {
            if (err) {
              console.error("❌ Database INSERT error:", err);
              return res.status(500).json({ message: "Error creating account" });
            }
            res.status(201).json({ message: "Account created successfully" });
          }
        );
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

    const { password: pwd, ...userWithoutPassword } = user;

    res.status(200).json({ message: "Login successful", user: userWithoutPassword });
  });
});

   // Update profile endpoint
app.put("/api/profile", async (req, res) => {
  try {
    const { id, name, email, doctorId, idNumber, contactNumber, role } = req.body;

    if (!id || !name || !email || !idNumber || !contactNumber) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (!/^\d{13}$/.test(idNumber)) {
      return res.status(400).json({ message: "ID Number must be exactly 13 digits" });
    }
    if (!/^\d{10}$/.test(contactNumber)) {
      return res.status(400).json({ message: "Contact Number must be exactly 10 digits" });
    }
    if (role === 'doctor' && !doctorId) {
      return res.status(400).json({ message: "Doctor ID is required" });
    }

    db.query("SELECT * FROM users WHERE email = ? AND id != ?", [email, id], (err, emailResults) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (emailResults.length > 0) return res.status(400).json({ message: "Email already in use" });

      db.query("SELECT * FROM users WHERE idNumber = ? AND id != ?", [idNumber, id], (err, idResults) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (idResults.length > 0) return res.status(400).json({ message: "ID Number already in use" });

        const sql = `
          UPDATE users
          SET name = ?, email = ?, doctorId = ?, idNumber = ?, contactNumber = ?
          WHERE id = ?
        `;
        db.query(sql, [name, email, doctorId || null, idNumber, contactNumber, id], (err, results) => {
          if (err) return res.status(500).json({ message: "Error updating profile" });
          if (results.affectedRows === 0) return res.status(404).json({ message: "User not found" });

          db.query("SELECT * FROM users WHERE id = ?", [id], (err, rows) => {
            if (err) return res.status(500).json({ message: "Database error" });
            if (rows.length === 0) return res.status(404).json({ message: "User not found" });

            const updatedUser = rows[0];
            delete updatedUser.password;

            res.status(200).json({
              message: "Profile updated successfully",
              user: updatedUser
            });
          });
        });
      });
    });
  } catch (error) {
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

// Add authentication middleware (simplified example)
const authenticate = (req, res, next) => {
  // In a real app, verify JWT token here
  const userId = req.headers['user-id']; // Temporary - use proper auth in production
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  req.user = { id: userId };
  next();
};

// Update the doctor records endpoint
app.get('/api/medical-records/doctor/:doctorId', authenticate, (req, res) => {
  const requestedDoctorId = req.params.doctorId;
  const authenticatedUserId = req.user.id;

  // Verify the requesting user is the same as the doctor they're requesting
  if (requestedDoctorId !== authenticatedUserId) {
    return res.status(403).json({ message: 'Access denied' });
  }

  db.query(
    'SELECT * FROM medical_records WHERE doctorId = ?',
    [requestedDoctorId],
    (err, results) => {
      if (err) {
        console.error('DB error fetching doctor records:', err);
        return res.status(500).json({ message: 'Failed to fetch records' });
      }
      
      const records = results.map(r => ({
        ...r,
        symptoms: deserializeSymptoms(r.symptoms),
      }));
      
      res.json(records);
    }
  );
});

// Add doctors endpoint
app.get('/api/doctors', (req, res) => {
  db.query(
    "SELECT id, firstName, lastName FROM users WHERE role = 'doctor'",
    (err, results) => {
      if (err) {
        console.error('DB error fetching doctors:', err);
        return res.status(500).json({ message: 'Failed to fetch doctors' });
      }
      res.json(results);
    }
  );
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

app.get('/api/patients', (req, res) => {
  const sql = "SELECT id, name, email FROM users WHERE role = 'patient'";
  db.query(sql, (err, results) => {
    if (err) {
      console.error('DB error fetching patients:', err);
      return res.status(500).json({ message: 'Failed to fetch patients' });
    }
    res.json(results);
  });
});

app.listen(5000, () => console.log("🚀 Server running on port 5000"));
