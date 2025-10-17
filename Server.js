import express from "express";
import mysql from "mysql2";
import mysqlPromise from "mysql2/promise";
import bcrypt from "bcryptjs";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config();
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // Your frontend URL
    methods: ["GET", "POST"]
  }
});

app.use(express.json());
app.use(cors());

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Function to broadcast ward updates to all connected clients
function broadcastWardUpdate(type, data) {
  io.emit('wardUpdate', { type, data });
}

// MySQL Connection
// Validate required environment variables early for clearer errors
const requiredEnvVars = ["DB_HOST", "DB_USER", "DB_NAME"]; 
const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key] || String(process.env[key]).trim() === "");

if (missingEnvVars.length > 0) {
  console.error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}.\n` +
    "Create a .env file with DB_HOST, DB_USER, DB_PASS (if needed), and DB_NAME."
  );
  process.exit(1);
}

console.log(
  `Attempting MySQL connection → host: ${process.env.DB_HOST}, port: ${process.env.DB_PORT || 3306}, user: ${process.env.DB_USER}`
);

let db;

// Function to populate database with initial mock data
async function populateInitialData(appConn) {
  try {
    // Check if wards table is empty and populate with mock data
    const [wardCount] = await appConn.query('SELECT COUNT(*) as count FROM wards');
    if (wardCount[0].count === 0) {
      console.log('📊 Populating wards table with initial data...');
      
      const mockWards = [
        {
          name: 'General Ward A',
          type: 'general',
          floorNumber: 2,
          totalBeds: 20,
          availableBeds: 7,
          managedBy: 'admin1'
        },
        {
          name: 'ICU',
          type: 'icu',
          floorNumber: 3,
          totalBeds: 10,
          availableBeds: 2,
          managedBy: 'admin1'
        },
        {
          name: 'Maternity Ward',
          type: 'maternity',
          floorNumber: 4,
          totalBeds: 15,
          availableBeds: 6,
          managedBy: 'admin1'
        },
        {
          name: 'Emergency Ward',
          type: 'emergency',
          floorNumber: 1,
          totalBeds: 15,
          availableBeds: 8,
          managedBy: 'admin1'
        },
        {
          name: 'Pediatric Ward',
          type: 'pediatric',
          floorNumber: 5,
          totalBeds: 12,
          availableBeds: 4,
          managedBy: 'admin1'
        },
        {
          name: 'Surgical Ward',
          type: 'surgical',
          floorNumber: 2,
          totalBeds: 18,
          availableBeds: 5,
          managedBy: 'admin1'
        }
      ];

      for (const ward of mockWards) {
        await appConn.query(`
          INSERT INTO wards (name, type, floorNumber, totalBeds, availableBeds, managedBy)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [ward.name, ward.type, ward.floorNumber, ward.totalBeds, ward.availableBeds, ward.managedBy]);
      }
      console.log(`✅ Added ${mockWards.length} wards to database`);
    }

    // Check if messages table is empty and populate with mock data
    const [messageCount] = await appConn.query('SELECT COUNT(*) as count FROM messages');
    if (messageCount[0].count === 0) {
      console.log('📊 Populating messages table with initial data...');
      
      const mockMessages = [
        {
          senderId: '2', // Dr. Sarah Johnson
          receiverId: '4', // Jane Smith (patient)
          subject: 'Test Results Available',
          content: 'Your recent blood test results are now available. Please schedule a follow-up appointment to discuss the results.',
          priority: 'normal',
          is_read: false,
          status: 'sent'
        },
        {
          senderId: '4', // Jane Smith (patient)
          receiverId: '2', // Dr. Sarah Johnson
          subject: 'Side Effects Question',
          content: 'I\'ve been experiencing some side effects from the new medication. Should I continue taking it?',
          priority: 'urgent',
          is_read: false,
          status: 'sent'
        },
        {
          senderId: '2', // Dr. Sarah Johnson
          receiverId: '4', // Jane Smith (patient)
          subject: 'Appointment Confirmation',
          content: 'Your appointment for next week has been confirmed. Please arrive 15 minutes early for paperwork.',
          priority: 'normal',
          is_read: false,
          status: 'sent'
        }
      ];

      for (const message of mockMessages) {
        await appConn.query(`
          INSERT INTO messages (senderId, receiverId, subject, content, priority, is_read, status)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [message.senderId, message.receiverId, message.subject, message.content, message.priority, message.is_read, message.status]);
      }
      console.log(`✅ Added ${mockMessages.length} messages to database`);
    }

    // Check if prescriptions table is empty and populate with mock data
    const [prescriptionCount] = await appConn.query('SELECT COUNT(*) as count FROM prescriptions');
    if (prescriptionCount[0].count === 0) {
      console.log('📊 Populating prescriptions table with initial data...');
      
      const mockPrescriptions = [
        {
          doctorId: 2, // Dr. Sarah Johnson
          patientId: 4, // Jane Smith
          medicineId: 1, // Amoxicillin
          dosage: '500mg',
          frequency: 'Every 8 hours',
          duration: '7 days',
          quantity: 21,
          instructions: 'Take with food',
          dateIssued: new Date().toISOString(),
          status: 'active',
          notes: 'For respiratory infection'
        },
        {
          doctorId: 2, // Dr. Sarah Johnson
          patientId: 4, // Jane Smith
          medicineId: 2, // Ibuprofen
          dosage: '400mg',
          frequency: 'As needed',
          duration: '5 days',
          quantity: 10,
          instructions: 'Take with plenty of water',
          dateIssued: new Date().toISOString(),
          status: 'active',
          notes: 'For pain management'
        }
      ];

      for (const prescription of mockPrescriptions) {
        await appConn.query(`
          INSERT INTO prescriptions (doctorId, patientId, medicineId, dosage, frequency, duration, quantity, instructions, dateIssued, status, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          prescription.doctorId, prescription.patientId, prescription.medicineId, 
          prescription.dosage, prescription.frequency, prescription.duration,
          prescription.quantity, prescription.instructions, prescription.dateIssued,
          prescription.status, prescription.notes
        ]);
      }
      console.log(`✅ Added ${mockPrescriptions.length} prescriptions to database`);
    }

    // Check if users table is empty and populate with basic users
    const [userCount] = await appConn.query('SELECT COUNT(*) as count FROM users');
    if (userCount[0].count === 0) {
      console.log('📊 Populating users table with initial data...');
      
      const mockUsers = [
        {
          name: 'Admin User',
          email: 'admin@hospital.com',
          password: await bcrypt.hash('admin123', 10),
          role: 'admin',
          doctorId: null,
          idNumber: '1234567890123',
          contactNumber: '0123456789'
        },
        {
          name: 'Dr. Sarah Johnson',
          email: 'doctor@hospital.com',
          password: await bcrypt.hash('doctor123', 10),
          role: 'doctor',
          doctorId: 'DOC001',
          idNumber: '2345678901234',
          contactNumber: '1234567890'
        },
        {
          name: 'Nurse Robert Chen',
          email: 'nurse@hospital.com',
          password: await bcrypt.hash('nurse123', 10),
          role: 'nurse',
          doctorId: null,
          idNumber: '3456789012345',
          contactNumber: '2345678901'
        },
        {
          name: 'Jane Smith',
          email: 'patient@example.com',
          password: await bcrypt.hash('patient123', 10),
          role: 'patient',
          doctorId: null,
          idNumber: '4567890123456',
          contactNumber: '3456789012'
        }
      ];

      for (const user of mockUsers) {
        await appConn.query(`
          INSERT INTO users (name, email, password, role, doctorId, idNumber, contactNumber)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [user.name, user.email, user.password, user.role, user.doctorId, user.idNumber, user.contactNumber]);
      }
      console.log(`✅ Added ${mockUsers.length} users to database`);
    }

    console.log('🎉 Database population completed successfully!');
  } catch (error) {
    console.error('❌ Error populating database with initial data:', error);
  }
}

async function ensureDatabaseAndTables() {
  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASS;
  const database = process.env.DB_NAME;

  // Connect without database to ensure it exists
  const rootConn = await mysqlPromise.createConnection({ host, port, user, password });
  await rootConn.query(
    `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await rootConn.end();

  // Connect to the target database
  const appConn = await mysqlPromise.createConnection({ host, port, user, password, database });

  // Create required tables if they do not exist
  await appConn.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'patient',
      doctorId VARCHAR(50) NULL,
      idNumber VARCHAR(13) NOT NULL UNIQUE,
      contactNumber VARCHAR(10) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await appConn.query(`
    CREATE TABLE IF NOT EXISTS medical_records (
      id INT AUTO_INCREMENT PRIMARY KEY,
      patientId INT NOT NULL,
      doctorId VARCHAR(50) NOT NULL,
      diagnosis VARCHAR(255) NOT NULL,
      symptoms TEXT,
      treatment TEXT,
      notes TEXT,
      date DATETIME NULL,
      lastUpdated DATETIME NULL,
      lastUpdatedBy VARCHAR(255),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_patient (patientId),
      INDEX idx_doctor (doctorId)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Create wards table
  await appConn.query(`
    CREATE TABLE IF NOT EXISTS wards (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      type ENUM('general', 'icu', 'emergency', 'maternity', 'pediatric', 'surgical') NOT NULL,
      floorNumber INT NOT NULL,
      totalBeds INT NOT NULL,
      availableBeds INT NOT NULL,
      managedBy VARCHAR(50) NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Create messages table
  await appConn.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      senderId VARCHAR(50) NOT NULL,
      receiverId VARCHAR(50) NOT NULL,
      subject VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_read BOOLEAN DEFAULT FALSE,
      status ENUM('sent', 'delivered', 'read', 'archived', 'deleted') DEFAULT 'sent',
      priority ENUM('normal', 'urgent') DEFAULT 'normal',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_sender (senderId),
      INDEX idx_receiver (receiverId),
      INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Create prescriptions table
  await appConn.query(`
    CREATE TABLE IF NOT EXISTS prescriptions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      doctorId INT NOT NULL,
      patientId INT NOT NULL,
      medicineId INT NOT NULL,
      dosage VARCHAR(255),
      frequency VARCHAR(255),
      duration VARCHAR(255),
      quantity INT,
      instructions TEXT,
      dateIssued DATETIME NOT NULL,
      status VARCHAR(50) DEFAULT 'active',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_patient (patientId),
      INDEX idx_doctor (doctorId),
      INDEX idx_medicine (medicineId)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Create appointments table
  await appConn.query(`
    CREATE TABLE IF NOT EXISTS appointments (
      id VARCHAR(50) PRIMARY KEY,
      patientId VARCHAR(50) NOT NULL,
      doctorId VARCHAR(50) NOT NULL,
      date DATE NOT NULL,
      startTime TIME NOT NULL,
      endTime TIME NOT NULL,
      type ENUM('regular', 'follow-up', 'emergency') NOT NULL DEFAULT 'regular',
      status ENUM('scheduled', 'completed', 'cancelled', 'no-show') NOT NULL DEFAULT 'scheduled',
      notes TEXT,
      createdBy VARCHAR(50) NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_patient (patientId),
      INDEX idx_doctor (doctorId),
      INDEX idx_date (date),
      INDEX idx_status (status),
      INDEX idx_createdBy (createdBy)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  console.log('✅ Appointments table structure verified');

  // Ensure doctorId uses VARCHAR to support IDs like 'DOC001'
  try {
    await appConn.query(`ALTER TABLE users MODIFY COLUMN doctorId VARCHAR(50) NULL`);
  } catch (e) {
    // Ignore if already the desired type or cannot alter in current context
  }

  // Populate database with initial mock data if tables are empty
  await populateInitialData(appConn);

  await appConn.end();

  // Create the non-promise connection used throughout the app
  db = mysql.createConnection({ host, port, user, password, database });

  await new Promise((resolve, reject) => {
    db.connect((err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

// Add this function after ensureDatabaseAndTables
async function updateAppointmentsTable() {
  try {
    const appConn = await mysqlPromise.createConnection({ 
      host: process.env.DB_HOST, 
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
      user: process.env.DB_USER, 
      password: process.env.DB_PASS, 
      database: process.env.DB_NAME 
    });

    // Check if createdBy column exists
    const [columns] = await appConn.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'appointments' AND COLUMN_NAME = 'createdBy'
    `, [process.env.DB_NAME]);

    if (columns.length === 0) {
      console.log('🔄 Adding createdBy column to appointments table...');
      await appConn.execute(`ALTER TABLE appointments ADD COLUMN createdBy VARCHAR(50) NOT NULL AFTER notes`);
      console.log('✅ createdBy column added successfully');
    }

    await appConn.end();
  } catch (error) {
    console.error('❌ Error updating appointments table:', error);
  }
}

// ==================== PRESCRIPTION CRUD OPERATIONS ====================

// GET all prescriptions (with optional filters)
app.get('/api/prescriptions', (req, res) => {
  const { patientId, doctorId, status } = req.query;
  let sql = `
    SELECT p.*, 
           u_patient.name as patientName,
           u_doctor.name as doctorName
    FROM prescriptions p
    LEFT JOIN users u_patient ON p.patientId = u_patient.id
    LEFT JOIN users u_doctor ON p.doctorId = u_doctor.id
  `;
  const params = [];
  
  if (patientId || doctorId || status) {
    sql += ' WHERE';
    const conditions = [];
    
    if (patientId) {
      conditions.push('p.patientId = ?');
      params.push(patientId);
    }
    if (doctorId) {
      conditions.push('p.doctorId = ?');
      params.push(doctorId);
    }
    if (status) {
      conditions.push('p.status = ?');
      params.push(status);
    }
    
    sql += ' ' + conditions.join(' AND ');
  }
  
  sql += ' ORDER BY p.date DESC, p.created_at DESC';
  
  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('DB error fetching prescriptions:', err);
      return res.status(500).json({ message: 'Failed to fetch prescriptions' });
    }
    res.json(results);
  });
});

// GET single prescription by ID
app.get('/api/prescriptions/:id', (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT p.*, 
           u_patient.name as patientName,
           u_doctor.name as doctorName
    FROM prescriptions p
    LEFT JOIN users u_patient ON p.patientId = u_patient.id
    LEFT JOIN users u_doctor ON p.doctorId = u_doctor.id
    WHERE p.id = ?
  `;
  
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('DB error fetching prescription:', err);
      return res.status(500).json({ message: 'Failed to fetch prescription' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Prescription not found' });
    }
    res.json(results[0]);
  });
});

// POST create new prescription
// POST create new prescription
app.post('/api/prescriptions', async (req, res) => {
  console.log('📥 Incoming prescription data:', req.body);

  const { doctorId, patientId, date, status, notes, medications } = req.body;

  // Validate required fields
  if (!doctorId || !patientId || !date || !Array.isArray(medications) || medications.length === 0) {
    console.log('❌ Missing required fields:', { doctorId, patientId, date, medications });
    return res.status(400).json({ message: 'Missing required fields or medications list' });
  }

  // Convert ISO date string to MySQL DATETIME format
  const convertToMySQLDateTime = (dateString) => {
    if (!dateString) return null;
    const d = new Date(dateString);
    return d.toISOString().slice(0, 19).replace('T', ' ');
  };

  const mysqlDateIssued = convertToMySQLDateTime(date);

  try {
    // 1️⃣ Insert the prescription record first
    const [prescriptionResult] = await db
      .promise()
      .query(
        `INSERT INTO prescriptions 
          (doctorId, patientId, date, status, notes, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [doctorId, patientId, mysqlDateIssued, status || 'active', notes || '']
      );

    const prescriptionId = prescriptionResult.insertId;
    console.log(`✅ Prescription record created (ID: ${prescriptionId})`);

    // 2️⃣ Insert related medications for this prescription
    for (const med of medications) {
      const { medicineId, dosage, frequency, duration, quantity, instructions } = med;

      if (!medicineId) {
        console.warn('⚠️ Skipping medication without medicineId:', med);
        continue;
      }

      await db
        .promise()
        .query(
          `INSERT INTO prescription_medicines 
             (prescriptionId, medicineId, dosage, frequency, duration, quantity, instructions)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            prescriptionId,
            medicineId,
            dosage || '',
            frequency || '',
            duration || '',
            quantity || 0,
            instructions || ''
          ]
        );
    }

    console.log('✅ All medications inserted for prescription.');

    // 3️⃣ Fetch the created prescription with joined user info
    const [createdPrescription] = await db
      .promise()
      .query(
        `SELECT p.*, 
                u_patient.name AS patientName,
                u_doctor.name AS doctorName
         FROM prescriptions p
         LEFT JOIN users u_patient ON p.patientId = u_patient.id
         LEFT JOIN users u_doctor ON p.doctorId = u_doctor.id
         WHERE p.id = ?`,
        [prescriptionId]
      );

    console.log('✅ Fetched created prescription:', createdPrescription[0]);
    res.status(201).json(createdPrescription[0]);

  } catch (err) {
    console.error('❌ Database error creating prescription:', err);
    res.status(500).json({ message: 'Failed to create prescription', error: err.message });
  }
});

// PUT update prescription
app.put('/api/prescriptions/:id', (req, res) => {
  const { id } = req.params;
  const {
    doctorId,
    patientId,
    medicineId,
    dosage,
    frequency,
    duration,
    quantity,
    instructions,
    dateIssued,
    status,
    notes
  } = req.body;
  
  console.log('📥 Update request for prescription:', id);
  console.log('📋 Update data:', req.body);
  
  if (!doctorId || !patientId || !medicineId || !dateIssued) {
    console.log('❌ Missing required fields:', { doctorId, patientId, medicineId, dateIssued });
    return res.status(400).json({ message: 'Missing required fields' });
  }
  
  // Convert ISO date string to MySQL DATETIME format
  const convertToMySQLDateTime = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toISOString().slice(0, 19).replace('T', ' ');
  };
  
  const mysqlDateIssued = convertToMySQLDateTime(dateIssued);
  
  console.log('🔄 Date conversion:', { original: dateIssued, converted: mysqlDateIssued });
  
  const sql = `
    UPDATE prescriptions 
    SET doctorId = ?, patientId = ?, medicineId = ?, dosage = ?, frequency = ?, duration = ?, 
        quantity = ?, instructions = ?, dateIssued = ?, status = ?, notes = ?
    WHERE id = ?
  `;
  
  console.log('🚀 Executing SQL:', sql);
  console.log('📋 With parameters:', [
    doctorId, patientId, medicineId, dosage || '', frequency || '', duration || '', 
    quantity || 0, instructions || '', mysqlDateIssued, status || 'active', notes || '', id
  ]);
  
  db.query(sql, [
    doctorId, patientId, medicineId, dosage || '', frequency || '', duration || '', 
    quantity || 0, instructions || '', mysqlDateIssued, status || 'active', notes || '', id
  ], (err, results) => {
    if (err) {
      console.error('❌ Database error updating prescription:', err);
      return res.status(500).json({ message: 'Failed to update prescription', error: err.message });
    }
    
    if (results.affectedRows === 0) {
      console.log('❌ No prescription found with ID:', id);
      return res.status(404).json({ message: 'Prescription not found' });
    }
    
    console.log('✅ Prescription updated successfully');
    
    // Fetch the updated prescription to return
    db.query(`
      SELECT p.*, 
             u_patient.name as patientName,
             u_doctor.name as doctorName
      FROM prescriptions p
      LEFT JOIN users u_patient ON p.patientId = u_patient.id
      LEFT JOIN users u_doctor ON p.doctorId = u_doctor.id
      WHERE p.id = ?
    `, [id], (err, prescriptionResults) => {
      if (err) {
        console.error('❌ DB error fetching updated prescription:', err);
        return res.status(500).json({ message: 'Prescription updated but failed to fetch details' });
      }
      res.json(prescriptionResults[0]);
    });
  });
});

// DELETE prescription
app.delete('/api/prescriptions/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM prescriptions WHERE id = ?';
  
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('DB error deleting prescription:', err);
      return res.status(500).json({ message: 'Failed to delete prescription' });
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Prescription not found' });
    }
    
    res.json({ message: 'Prescription deleted successfully' });
  });
});

// GET medicines (you'll need to create a medicines table or use static data)
app.get('/api/medicines', (req, res) => {
  // For now, return some sample medicines
  // In a real application, you'd have a medicines table
  const sampleMedicines = [
    { id: 1, name: 'Amoxicillin', type: 'Antibiotic' },
    { id: 2, name: 'Ibuprofen', type: 'Pain Reliever' },
    { id: 3, name: 'Lisinopril', type: 'Blood Pressure' },
    { id: 4, name: 'Metformin', type: 'Diabetes' },
    { id: 5, name: 'Atorvastatin', type: 'Cholesterol' },
    { id: 6, name: 'Albuterol', type: 'Asthma' },
    { id: 7, name: 'Omeprazole', type: 'Acid Reducer' },
    { id: 8, name: 'Sertraline', type: 'Antidepressant' }
  ];
  
  res.json(sampleMedicines);
});

// ==================== APPOINTMENT CRUD OPERATIONS ====================

// GET all appointments (with optional filters)
app.get('/api/appointments', (req, res) => {
  const { patientId, doctorId, status, date } = req.query;
  let sql = `
    SELECT a.*, 
           u_patient.name as patientName,
           u_doctor.name as doctorName,
           u_creator.name as createdByName
    FROM appointments a
    LEFT JOIN users u_patient ON a.patientId = u_patient.id
    LEFT JOIN users u_doctor ON a.doctorId = u_doctor.id
    LEFT JOIN users u_creator ON a.createdBy = u_creator.id
  `;
  const params = [];
  
  if (patientId || doctorId || status || date) {
    sql += ' WHERE';
    const conditions = [];
    
    if (patientId) {
      conditions.push('a.patientId = ?');
      params.push(patientId);
    }
    if (doctorId) {
      conditions.push('a.doctorId = ?');
      params.push(doctorId);
    }
    if (status) {
      conditions.push('a.status = ?');
      params.push(status);
    }
    if (date) {
      conditions.push('a.date = ?');
      params.push(date);
    }
    
    sql += ' ' + conditions.join(' AND ');
  }
  
  sql += ' ORDER BY a.date DESC, a.startTime DESC';
  
  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('DB error fetching appointments:', err);
      return res.status(500).json({ message: 'Failed to fetch appointments' });
    }
    res.json(results);
  });
});

// GET single appointment by ID
app.get('/api/appointments/:id', (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT a.*, 
           u_patient.name as patientName,
           u_doctor.name as doctorName,
           u_creator.name as createdByName
    FROM appointments a
    LEFT JOIN users u_patient ON a.patientId = u_patient.id
    LEFT JOIN users u_doctor ON a.doctorId = u_doctor.id
    LEFT JOIN users u_creator ON a.createdBy = u_creator.id
    WHERE a.id = ?
  `;
  
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('DB error fetching appointment:', err);
      return res.status(500).json({ message: 'Failed to fetch appointment' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(results[0]);
  });
});

// POST create new appointment
app.post('/api/appointments', (req, res) => {
  console.log('📥 Incoming appointment data:', req.body);
  
  const { id, patientId, doctorId, date, startTime, endTime, type, status, notes, createdBy } = req.body;
  
  if (!id || !patientId || !doctorId || !date || !startTime || !endTime || !createdBy) {
    console.log('❌ Missing required fields:', { id, patientId, doctorId, date, startTime, endTime, createdBy });
    return res.status(400).json({ message: 'Missing required fields' });
  }
  
  // Convert ISO date string to MySQL DATE format (YYYY-MM-DD)
  const convertToMySQLDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Extract just the date part
  };
  
  const mysqlDate = convertToMySQLDate(date);
  
  console.log('🔄 Date conversion:', { original: date, converted: mysqlDate });
  
  const sql = `
    INSERT INTO appointments (id, patientId, doctorId, date, startTime, endTime, type, status, notes, createdBy)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  console.log('🚀 Executing SQL:', sql);
  console.log('📋 With parameters:', [id, patientId, doctorId, mysqlDate, startTime, endTime, type || 'regular', status || 'scheduled', notes || '', createdBy]);
  
  db.query(sql, [
    id, patientId, doctorId, mysqlDate, startTime, endTime, 
    type || 'regular', status || 'scheduled', notes || '', createdBy
  ], (err, results) => {
    if (err) {
      console.error('❌ Database error creating appointment:', err);
      return res.status(500).json({ message: 'Failed to create appointment', error: err.message });
    }
    
    console.log('✅ Appointment created successfully, ID:', id);
    
    // Fetch the created appointment to return
    db.query(`
      SELECT a.*, 
             u_patient.name as patientName,
             u_doctor.name as doctorName,
             u_creator.name as createdByName
      FROM appointments a
      LEFT JOIN users u_patient ON a.patientId = u_patient.id
      LEFT JOIN users u_doctor ON a.doctorId = u_doctor.id
      LEFT JOIN users u_creator ON a.createdBy = u_creator.id
      WHERE a.id = ?
    `, [id], (err, appointmentResults) => {
      if (err) {
        console.error('❌ DB error fetching created appointment:', err);
        return res.status(500).json({ message: 'Appointment created but failed to fetch details' });
      }
      console.log('✅ Fetched created appointment:', appointmentResults[0]);
      res.status(201).json(appointmentResults[0]);
    });
  });
});

// PUT update appointment
app.put('/api/appointments/:id', (req, res) => {
  const { id } = req.params;
  const { patientId, doctorId, date, startTime, endTime, type, status, notes } = req.body;
  
  console.log('📥 Update request for appointment:', id);
  console.log('📋 Update data:', req.body);
  
  if (!patientId || !doctorId || !date || !startTime || !endTime) {
    console.log('❌ Missing required fields:', { patientId, doctorId, date, startTime, endTime });
    return res.status(400).json({ message: 'Missing required fields' });
  }
  
  // Convert ISO date string to MySQL DATE format (YYYY-MM-DD)
  const convertToMySQLDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Extract just the date part
  };
  
  const mysqlDate = convertToMySQLDate(date);
  
  console.log('🔄 Date conversion:', { original: date, converted: mysqlDate });
  
  const sql = `
    UPDATE appointments 
    SET patientId = ?, doctorId = ?, date = ?, startTime = ?, endTime = ?, type = ?, status = ?, notes = ?
    WHERE id = ?
  `;
  
  console.log('🚀 Executing SQL:', sql);
  console.log('📋 With parameters:', [patientId, doctorId, mysqlDate, startTime, endTime, type, status, notes, id]);
  
  db.query(sql, [
    patientId, doctorId, mysqlDate, startTime, endTime, type, status, notes, id
  ], (err, results) => {
    if (err) {
      console.error('❌ Database error updating appointment:', err);
      return res.status(500).json({ message: 'Failed to update appointment', error: err.message });
    }
    
    if (results.affectedRows === 0) {
      console.log('❌ No appointment found with ID:', id);
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    console.log('✅ Appointment updated successfully');
    
    // Fetch the updated appointment to return
    db.query(`
      SELECT a.*, 
             u_patient.name as patientName,
             u_doctor.name as doctorName,
             u_creator.name as createdByName
      FROM appointments a
      LEFT JOIN users u_patient ON a.patientId = u_patient.id
      LEFT JOIN users u_doctor ON a.doctorId = u_doctor.id
      LEFT JOIN users u_creator ON a.createdBy = u_creator.id
      WHERE a.id = ?
    `, [id], (err, appointmentResults) => {
      if (err) {
        console.error('❌ DB error fetching updated appointment:', err);
        return res.status(500).json({ message: 'Appointment updated but failed to fetch details' });
      }
      res.json(appointmentResults[0]);
    });
  });
});

// DELETE appointment
app.delete('/api/appointments/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM appointments WHERE id = ?';
  
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('DB error deleting appointment:', err);
      return res.status(500).json({ message: 'Failed to delete appointment' });
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    res.json({ message: 'Appointment deleted successfully' });
  });
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

// Update the doctor records endpoint to show all patients' records
// Update the doctor records endpoint - remove authentication for now
app.get('/api/medical-records/doctor/:doctorId', (req, res) => {
  const requestedDoctorId = req.params.doctorId;

  // For now, let doctors see all medical records without strict authentication
  const sql = `
    SELECT 
      mr.*,
      d.name as doctorName,
      p.name as patientName
    FROM medical_records mr
    LEFT JOIN users d ON mr.doctorId = d.id
    LEFT JOIN users p ON mr.patientId = p.id
    ORDER BY mr.date DESC
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('DB error fetching doctor records:', err);
      return res.status(500).json({ message: 'Failed to fetch records' });
    }
    
    console.log('🔍 Medical records with doctor info:', results);
    
    const records = results.map(r => ({
      ...r,
      symptoms: deserializeSymptoms(r.symptoms),
      doctorName: r.doctorName,
      patientName: r.patientName
    }));
    
    res.json(records);
  });
});

// GET medical records for a specific patient
app.get('/api/medical-records/patient/:patientId', (req, res) => {
  const { patientId } = req.params;

  const sql = `
    SELECT 
      mr.*,
      d.name as doctorName
    FROM medical_records mr
    LEFT JOIN users d ON mr.doctorId = d.id
    WHERE mr.patientId = ?
    ORDER BY mr.date DESC
  `;
  
  db.query(sql, [patientId], (err, results) => {
    if (err) {
      console.error('DB error fetching patient records:', err);
      return res.status(500).json({ message: 'Failed to fetch records' });
    }
    
    const records = results.map(r => ({
      ...r,
      symptoms: deserializeSymptoms(r.symptoms),
    }));
    
    res.json(records);
  });
});

// Add doctors endpoint
app.get('/api/doctors', (req, res) => {
  db.query(
     "SELECT id, name, email, contactNumber FROM users WHERE role = 'doctor'",
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
  const sql = "SELECT id, name, email, contactNumber, idNumber, role, doctorId FROM users WHERE role = 'patient'"; // ← Added idNumber
  db.query(sql, (err, results) => {
    if (err) {
      console.error('DB error fetching patients:', err);
      return res.status(500).json({ message: 'Failed to fetch patients' });
    }
    res.json(results);
  });
});

// ==================== WARD CRUD OPERATIONS ====================

// GET all wards
app.get('/api/wards', (req, res) => {
  const sql = 'SELECT * FROM wards ORDER BY name';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('DB error fetching wards:', err);
      return res.status(500).json({ message: 'Failed to fetch wards' });
    }
    res.json(results);
  });
});

// GET single ward by ID
app.get('/api/wards/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM wards WHERE id = ?';
  
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('DB error fetching ward:', err);
      return res.status(500).json({ message: 'Failed to fetch ward' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Ward not found' });
    }
    res.json(results[0]);
  });
});

// POST create new ward
app.post('/api/wards', (req, res) => {
  const { name, type, floorNumber, totalBeds, availableBeds, managedBy } = req.body;
  
  if (!name || !type || !floorNumber || !totalBeds || availableBeds === undefined) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  
  const sql = `
    INSERT INTO wards (name, type, floorNumber, totalBeds, availableBeds, managedBy)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  db.query(sql, [name, type, floorNumber, totalBeds, availableBeds, managedBy || null], (err, results) => {
    if (err) {
      console.error('DB error creating ward:', err);
      return res.status(500).json({ message: 'Failed to create ward' });
    }
    
    // Fetch the created ward to return
    const newWardId = results.insertId;
    db.query('SELECT * FROM wards WHERE id = ?', [newWardId], (err, wardResults) => {
      if (err) {
        console.error('DB error fetching created ward:', err);
        return res.status(500).json({ message: 'Ward created but failed to fetch details' });
      }
      
      const newWard = wardResults[0];
      
      // Broadcast the new ward to all connected clients
      broadcastWardUpdate('created', newWard);
      
      res.status(201).json(newWard);
    });
  });
});

// PUT update ward
app.put('/api/wards/:id', (req, res) => {
  const { id } = req.params;
  const { name, type, floorNumber, totalBeds, availableBeds, managedBy } = req.body;
  
  if (!name || !type || !floorNumber || !totalBeds || availableBeds === undefined) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  
  const sql = `
    UPDATE wards 
    SET name = ?, type = ?, floorNumber = ?, totalBeds = ?, availableBeds = ?, managedBy = ?
    WHERE id = ?
  `;
  
  db.query(sql, [name, type, floorNumber, totalBeds, availableBeds, managedBy || null, id], (err, results) => {
    if (err) {
      console.error('DB error updating ward:', err);
      return res.status(500).json({ message: 'Failed to update ward' });
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Ward not found' });
    }
    
    // Fetch the updated ward to return
    db.query('SELECT * FROM wards WHERE id = ?', [id], (err, wardResults) => {
      if (err) {
        console.error('DB error fetching updated ward:', err);
        return res.status(500).json({ message: 'Ward updated but failed to fetch details' });
      }
      
      const updatedWard = wardResults[0];
      
      // Broadcast the updated ward to all connected clients
      broadcastWardUpdate('updated', updatedWard);
      
      res.json(updatedWard);
    });
  });
});

// DELETE ward
app.delete('/api/wards/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM wards WHERE id = ?';
  
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('DB error deleting ward:', err);
      return res.status(500).json({ message: 'Failed to delete ward' });
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Ward not found' });
    }
    
    // Broadcast the deleted ward ID to all connected clients
    broadcastWardUpdate('deleted', { id });
    
    res.json({ message: 'Ward deleted successfully' });
  });
});

// ==================== USER CRUD OPERATIONS ====================

// GET all users (with optional role filter)
app.get('/api/users', (req, res) => {
  const { role } = req.query;
  let sql = 'SELECT id, name, email, role, contactNumber, idNumber, doctorId FROM users'; // ← Added idNumber
  const params = [];
  
  if (role) {
    sql += ' WHERE role = ?';
    params.push(role);
  }
  
  sql += ' ORDER BY name ASC';
  
  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('DB error fetching users:', err);
      return res.status(500).json({ message: 'Failed to fetch users' });
    }
    res.json(results);
  });
});

// GET single user by ID
app.get('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT id, name, email, role, contactNumber FROM users WHERE id = ?';
  
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('DB error fetching user:', err);
      return res.status(500).json({ message: 'Failed to fetch user' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(results[0]);
  });
});

// ==================== MESSAGE CRUD OPERATIONS ====================

// GET all messages (with optional filters)
app.get('/api/messages', (req, res) => {
  const { senderId, receiverId, status, priority } = req.query;
  let sql = 'SELECT * FROM messages';
  const params = [];
  
  if (senderId || receiverId || status || priority) {
    sql += ' WHERE';
    const conditions = [];
    
    if (senderId) {
      conditions.push('senderId = ?');
      params.push(senderId);
    }
    if (receiverId) {
      conditions.push('receiverId = ?');
      params.push(receiverId);
    }
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }
    if (priority) {
      conditions.push('priority = ?');
      params.push(priority);
    }
    
    sql += ' ' + conditions.join(' AND ');
  }
  
  sql += ' ORDER BY timestamp DESC';
  
  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('DB error fetching messages:', err);
      return res.status(500).json({ message: 'Failed to fetch messages' });
    }
    res.json(results);
  });
});

// GET single message by ID
app.get('/api/messages/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM messages WHERE id = ?';
  
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('DB error fetching message:', err);
      return res.status(500).json({ message: 'Failed to fetch message' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json(results[0]);
  });
});

// POST create new message
app.post('/api/messages', (req, res) => {
  const { senderId, receiverId, subject, content, priority } = req.body;
  
  if (!senderId || !receiverId || !subject || !content) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  
  const sql = `
    INSERT INTO messages (senderId, receiverId, subject, content, priority)
    VALUES (?, ?, ?, ?, ?)
  `;
  
  db.query(sql, [senderId, receiverId, subject, content, priority || 'normal'], (err, results) => {
    if (err) {
      console.error('DB error creating message:', err);
      return res.status(500).json({ message: 'Failed to create message' });
    }
    
    // Fetch the created message to return
    const newMessageId = results.insertId;
    db.query('SELECT * FROM messages WHERE id = ?', [newMessageId], (err, messageResults) => {
      if (err) {
        console.error('DB error fetching created message:', err);
        return res.status(500).json({ message: 'Message created but failed to fetch details' });
      }
      res.status(201).json(messageResults[0]);
    });
  });
});

// PUT update message
app.put('/api/messages/:id', (req, res) => {
  const { id } = req.params;
  const { subject, content, status, priority, is_read } = req.body;
  
  if (!subject || !content) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  
  const sql = `
    UPDATE messages 
    SET subject = ?, content = ?, status = ?, priority = ?, is_read = ?
    WHERE id = ?
  `;
  
  db.query(sql, [subject, content, status || 'sent', priority || 'normal', is_read || false, id], (err, results) => {
    if (err) {
      console.error('DB error updating message:', err);
      return res.status(500).json({ message: 'Failed to update message' });
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Fetch the updated message to return
    db.query('SELECT * FROM messages WHERE id = ?', [id], (err, messageResults) => {
      if (err) {
        console.error('DB error fetching updated message:', err);
        return res.status(500).json({ message: 'Message updated but failed to fetch details' });
      }
      res.json(messageResults[0]);
    });
  });
});

// DELETE message
app.delete('/api/messages/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM messages WHERE id = ?';
  
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('DB error deleting message:', err);
      return res.status(500).json({ message: 'Failed to delete message' });
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    res.json({ message: 'Message deleted successfully' });
  });
});

// PATCH mark message as read
app.patch('/api/messages/:id/read', (req, res) => {
  const { id } = req.params;
  const sql = 'UPDATE messages SET is_read = TRUE, status = "read" WHERE id = ?';
  
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('DB error marking message as read:', err);
      return res.status(500).json({ message: 'Failed to mark message as read' });
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    res.json({ message: 'Message marked as read' });
  });
});

// Start server only after DB is ready
(async () => {
  try {
    await ensureDatabaseAndTables();
    await updateAppointmentsTable(); // Add this line
    httpServer.listen(5000, () => console.log("🚀 Server running on port 5000"));
  } catch (error) {
    console.error("❌ Failed to initialize database:", error);
    process.exit(1);
  }
})();