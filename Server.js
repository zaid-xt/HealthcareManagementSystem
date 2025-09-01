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

    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
      if (err) {
        console.error("❌ Database SELECT error:", err);
        return res.status(500).json({ message: "Database error" });
      }

      if (results.length > 0) {
        return res.status(400).json({ message: "Email already registered" });
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
    const { id, name, email, doctorId, idNumber, contactNumber } = req.body;

    if (!id || !name || !email || !idNumber || !contactNumber) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!/^\d{13}$/.test(idNumber)) {
      return res.status(400).json({ message: "ID Number must be exactly 13 digits" });
    }

    if (!/^\d{10}$/.test(contactNumber)) {
      return res.status(400).json({ message: "Contact Number must be exactly 10 digits" });
    }

    if (req.body.role === 'doctor' && !doctorId) {
      return res.status(400).json({ message: "Doctor ID is required" });
    }

    const sql = `UPDATE users 
                 SET name = ?, email = ?, doctorId = ?, idNumber = ?, contactNumber = ?
                 WHERE id = ?`;
    
    db.query(sql, 
      [
        name, 
        email, 
        doctorId || null, 
        idNumber, 
        contactNumber, 
        id
      ], 
      (err, results) => {
        if (err) {
          console.error("❌ Database UPDATE error:", err);
          return res.status(500).json({ message: "Error updating profile" });
        }
        
        if (results.affectedRows === 0) {
          return res.status(404).json({ message: "User not found" });
        }
        
        res.status(200).json({ message: "Profile updated successfully" });
      }
    );
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

// Prescription endpoints

// GET all prescriptions
app.get('/api/prescriptions', (req, res) => {
  const sql = `
    SELECT p.*, u.name as patientName, d.firstName as doctorFirstName, d.lastName as doctorLastName
    FROM prescriptions p
    LEFT JOIN users u ON p.patientId = u.id
    LEFT JOIN doctors d ON p.doctorId = d.id
    ORDER BY p.date DESC
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('DB error fetching prescriptions:', err);
      return res.status(500).json({ message: 'Failed to fetch prescriptions' });
    }
    res.json(results);
  });
});

// POST create new prescription
app.post('/api/prescriptions', (req, res) => {
  const { patientId, doctorId, date, status, notes, medications } = req.body;

  if (!patientId || !doctorId || !date || !medications || medications.length === 0) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Start transaction
  db.beginTransaction((err) => {
    if (err) {
      console.error('Transaction start error:', err);
      return res.status(500).json({ message: 'Database transaction error' });
    }

    // Insert prescription
    const prescriptionSql = `
      INSERT INTO prescriptions (patientId, doctorId, date, status, notes, createdBy)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(prescriptionSql, [patientId, doctorId, date, status || 'active', notes || '', doctorId], (err, prescriptionResult) => {
      if (err) {
        return db.rollback(() => {
          console.error('DB error inserting prescription:', err);
          res.status(500).json({ message: 'Failed to create prescription' });
        });
      }

      const prescriptionId = prescriptionResult.insertId;

      // Insert order lines
      const orderLineSql = `
        INSERT INTO order_lines (prescriptionId, medicineId, dosage, frequency, duration, quantity, instructions)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      let completedInserts = 0;
      const totalInserts = medications.length;

      medications.forEach((medication) => {
        db.query(orderLineSql, [
          prescriptionId,
          medication.medicineId,
          medication.dosage,
          medication.frequency,
          medication.duration,
          medication.quantity,
          medication.instructions || ''
        ], (err) => {
          if (err) {
            return db.rollback(() => {
              console.error('DB error inserting order line:', err);
              res.status(500).json({ message: 'Failed to create prescription medications' });
            });
          }

          completedInserts++;
          if (completedInserts === totalInserts) {
            db.commit((err) => {
              if (err) {
                return db.rollback(() => {
                  console.error('Transaction commit error:', err);
                  res.status(500).json({ message: 'Failed to save prescription' });
                });
              }
              res.status(201).json({ id: prescriptionId, message: 'Prescription created successfully' });
            });
          }
        });
      });
    });
  });
});

// PUT update prescription
app.put('/api/prescriptions/:id', (req, res) => {
  const prescriptionId = req.params.id;
  const { patientId, doctorId, date, status, notes, medications } = req.body;

  if (!patientId || !doctorId || !date || !medications || medications.length === 0) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Start transaction
  db.beginTransaction((err) => {
    if (err) {
      console.error('Transaction start error:', err);
      return res.status(500).json({ message: 'Database transaction error' });
    }

    // Update prescription
    const prescriptionSql = `
      UPDATE prescriptions 
      SET patientId = ?, doctorId = ?, date = ?, status = ?, notes = ?
      WHERE id = ?
    `;

    db.query(prescriptionSql, [patientId, doctorId, date, status, notes || '', prescriptionId], (err, result) => {
      if (err) {
        return db.rollback(() => {
          console.error('DB error updating prescription:', err);
          res.status(500).json({ message: 'Failed to update prescription' });
        });
      }

      if (result.affectedRows === 0) {
        return db.rollback(() => {
          res.status(404).json({ message: 'Prescription not found' });
        });
      }

      // Delete existing order lines
      const deleteOrderLinesSql = 'DELETE FROM order_lines WHERE prescriptionId = ?';
      db.query(deleteOrderLinesSql, [prescriptionId], (err) => {
        if (err) {
          return db.rollback(() => {
            console.error('DB error deleting order lines:', err);
            res.status(500).json({ message: 'Failed to update prescription medications' });
          });
        }

        // Insert new order lines
        const orderLineSql = `
          INSERT INTO order_lines (prescriptionId, medicineId, dosage, frequency, duration, quantity, instructions)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        let completedInserts = 0;
        const totalInserts = medications.length;

        medications.forEach((medication) => {
          db.query(orderLineSql, [
            prescriptionId,
            medication.medicineId,
            medication.dosage,
            medication.frequency,
            medication.duration,
            medication.quantity,
            medication.instructions || ''
          ], (err) => {
            if (err) {
              return db.rollback(() => {
                console.error('DB error inserting order line:', err);
                res.status(500).json({ message: 'Failed to update prescription medications' });
              });
            }

            completedInserts++;
            if (completedInserts === totalInserts) {
              db.commit((err) => {
                if (err) {
                  return db.rollback(() => {
                    console.error('Transaction commit error:', err);
                    res.status(500).json({ message: 'Failed to save prescription changes' });
                  });
                }
                res.json({ message: 'Prescription updated successfully' });
              });
            }
          });
        });
      });
    });
  });
});

// DELETE prescription
app.delete('/api/prescriptions/:id', (req, res) => {
  const prescriptionId = req.params.id;

  // Start transaction
  db.beginTransaction((err) => {
    if (err) {
      console.error('Transaction start error:', err);
      return res.status(500).json({ message: 'Database transaction error' });
    }

    // Delete order lines first (foreign key constraint)
    const deleteOrderLinesSql = 'DELETE FROM order_lines WHERE prescriptionId = ?';
    db.query(deleteOrderLinesSql, [prescriptionId], (err) => {
      if (err) {
        return db.rollback(() => {
          console.error('DB error deleting order lines:', err);
          res.status(500).json({ message: 'Failed to delete prescription medications' });
        });
      }

      // Delete prescription
      const deletePrescriptionSql = 'DELETE FROM prescriptions WHERE id = ?';
      db.query(deletePrescriptionSql, [prescriptionId], (err, result) => {
        if (err) {
          return db.rollback(() => {
            console.error('DB error deleting prescription:', err);
            res.status(500).json({ message: 'Failed to delete prescription' });
          });
        }

        if (result.affectedRows === 0) {
          return db.rollback(() => {
            res.status(404).json({ message: 'Prescription not found' });
          });
        }

        db.commit((err) => {
          if (err) {
            return db.rollback(() => {
              console.error('Transaction commit error:', err);
              res.status(500).json({ message: 'Failed to delete prescription' });
            });
          }
          res.json({ message: 'Prescription deleted successfully' });
        });
      });
    });
  });
});

// GET prescription by ID with order lines
app.get('/api/prescriptions/:id', (req, res) => {
  const prescriptionId = req.params.id;
  
  const prescriptionSql = `
    SELECT p.*, u.name as patientName, d.firstName as doctorFirstName, d.lastName as doctorLastName
    FROM prescriptions p
    LEFT JOIN users u ON p.patientId = u.id
    LEFT JOIN doctors d ON p.doctorId = d.id
    WHERE p.id = ?
  `;
  
  const orderLinesSql = `
    SELECT ol.*, m.name as medicineName, m.dosageForm
    FROM order_lines ol
    LEFT JOIN medicines m ON ol.medicineId = m.id
    WHERE ol.prescriptionId = ?
  `;

  db.query(prescriptionSql, [prescriptionId], (err, prescriptionResults) => {
    if (err) {
      console.error('DB error fetching prescription:', err);
      return res.status(500).json({ message: 'Failed to fetch prescription' });
    }

    if (prescriptionResults.length === 0) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    db.query(orderLinesSql, [prescriptionId], (err, orderLinesResults) => {
      if (err) {
        console.error('DB error fetching order lines:', err);
        return res.status(500).json({ message: 'Failed to fetch prescription details' });
      }

      const prescription = {
        ...prescriptionResults[0],
        medications: orderLinesResults
      };

      res.json(prescription);
    });
  });
});

// GET medicines for prescription form
app.get('/api/medicines', (req, res) => {
  const sql = 'SELECT * FROM medicines WHERE availableQuantity > 0 ORDER BY name';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('DB error fetching medicines:', err);
      return res.status(500).json({ message: 'Failed to fetch medicines' });
    }
    res.json(results);
  });
});

// GET doctors for prescription form
app.get('/api/doctors', (req, res) => {
  const sql = 'SELECT id, firstName, lastName, specialization FROM doctors ORDER BY firstName, lastName';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('DB error fetching doctors:', err);
      return res.status(500).json({ message: 'Failed to fetch doctors' });
    }
    res.json(results);
  });
});

app.listen(5000, () => console.log("🚀 Server running on port 5000"));
