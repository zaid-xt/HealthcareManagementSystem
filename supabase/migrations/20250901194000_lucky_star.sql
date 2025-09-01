-- Healthcare Management System Database Schema

-- Users table (already exists, but adding for reference)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'doctor', 'patient') NOT NULL,
  doctorId VARCHAR(50),
  idNumber VARCHAR(13) NOT NULL,
  contactNumber VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Doctors table
CREATE TABLE IF NOT EXISTS doctors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT,
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  specialization VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL,
  contactNumber VARCHAR(15) NOT NULL,
  email VARCHAR(255) NOT NULL,
  licenseNumber VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Medicines table
CREATE TABLE IF NOT EXISTS medicines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  dosageForm ENUM('tablet', 'capsule', 'liquid', 'injection', 'topical', 'inhaler') NOT NULL,
  manufacturer VARCHAR(255),
  availableQuantity INT DEFAULT 0,
  unitPrice DECIMAL(10, 2) DEFAULT 0.00,
  expiryDate DATE,
  lastUpdatedBy INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (lastUpdatedBy) REFERENCES users(id)
);

-- Prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patientId INT NOT NULL,
  doctorId INT NOT NULL,
  date DATE NOT NULL,
  status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
  notes TEXT,
  createdBy INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patientId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (doctorId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (createdBy) REFERENCES users(id)
);

-- Order Lines table (prescription medications)
CREATE TABLE IF NOT EXISTS order_lines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  prescriptionId INT NOT NULL,
  medicineId INT NOT NULL,
  dosage VARCHAR(100) NOT NULL,
  frequency VARCHAR(100) NOT NULL,
  duration VARCHAR(100) NOT NULL,
  quantity INT NOT NULL,
  instructions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (prescriptionId) REFERENCES prescriptions(id) ON DELETE CASCADE,
  FOREIGN KEY (medicineId) REFERENCES medicines(id)
);

-- Insert sample medicines
INSERT IGNORE INTO medicines (id, name, description, dosageForm, manufacturer, availableQuantity, unitPrice, expiryDate, lastUpdatedBy) VALUES
(1, 'Lisinopril', 'ACE inhibitor for hypertension', 'tablet', 'PharmaCorp', 500, 0.85, '2025-12-31', 1),
(2, 'Sumatriptan', 'For acute migraine treatment', 'tablet', 'MediHealth', 200, 12.50, '2025-12-31', 1),
(3, 'Amoxicillin', 'Antibiotic for bacterial infections', 'capsule', 'GeneriCo', 350, 0.65, '2025-12-31', 1),
(4, 'Metformin', 'For type 2 diabetes management', 'tablet', 'DiabetesCare', 400, 0.45, '2025-12-31', 1),
(5, 'Ibuprofen', 'Anti-inflammatory pain reliever', 'tablet', 'PainRelief Inc', 600, 0.25, '2025-12-31', 1),
(6, 'Omeprazole', 'Proton pump inhibitor for acid reflux', 'capsule', 'GastroMed', 300, 1.20, '2025-12-31', 1),
(7, 'Atorvastatin', 'Statin for cholesterol management', 'tablet', 'CardioPharm', 250, 1.85, '2025-12-31', 1),
(8, 'Albuterol', 'Bronchodilator for asthma', 'inhaler', 'RespiCare', 150, 25.00, '2025-12-31', 1);

-- Insert sample doctors
INSERT IGNORE INTO doctors (id, userId, firstName, lastName, specialization, department, contactNumber, email, licenseNumber) VALUES
(1, 2, 'Sarah', 'Johnson', 'Cardiology', 'Cardiology', '555-4321', 'dr.sarah@hospital.com', 'MD12345'),
(2, 3, 'James', 'Wilson', 'Neurology', 'Neurology', '555-8642', 'dr.wilson@hospital.com', 'MD67890');