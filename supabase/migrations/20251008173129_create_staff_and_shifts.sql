/*
  # Create Staff and Shifts Management System

  ## Overview
  This migration creates tables for managing hospital staff, their shifts, and duty status.
  It enables real-time tracking of who is on duty, shift schedules, and department coverage.

  ## New Tables
  
  ### `staff`
  - `id` (uuid, primary key) - Unique identifier for each staff member
  - `user_id` (uuid, foreign key) - Links to auth.users table
  - `employee_id` (text, unique) - Hospital employee ID
  - `full_name` (text) - Staff member's full name
  - `role` (text) - Job title/role (e.g., Doctor, Nurse, Technician)
  - `department` (text) - Department assignment (e.g., Emergency, Surgery, Pediatrics)
  - `email` (text) - Contact email
  - `phone` (text) - Contact phone number
  - `hire_date` (date) - Date of hire
  - `status` (text) - Employment status (Active, On Leave, etc.)
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Record update timestamp

  ### `shifts`
  - `id` (uuid, primary key) - Unique identifier for each shift
  - `staff_id` (uuid, foreign key) - Links to staff table
  - `shift_date` (date) - Date of the shift
  - `start_time` (time) - Shift start time
  - `end_time` (time) - Shift end time
  - `department` (text) - Department for this shift
  - `status` (text) - Shift status (Scheduled, In Progress, Completed, Cancelled)
  - `notes` (text, optional) - Additional notes about the shift
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Record update timestamp

  ## Security
  
  ### Row Level Security (RLS)
  - Enable RLS on both `staff` and `shifts` tables
  - Authenticated users can read all staff records (for roster/schedule viewing)
  - Authenticated users can read all shift records
  - Only admins can insert/update/delete staff records
  - Only admins and managers can insert/update/delete shift records

  ## Important Notes
  1. The system tracks current duty status by checking if current time falls within a shift's time range
  2. Department coverage is calculated by counting active staff members per department
  3. All times are stored in the database timezone and converted to local time in the frontend
  4. The `status` field on shifts helps track shift lifecycle independently of time calculations
*/

-- Create staff table
CREATE TABLE IF NOT EXISTS staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  employee_id text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL,
  department text NOT NULL,
  email text NOT NULL,
  phone text DEFAULT '',
  hire_date date DEFAULT CURRENT_DATE,
  status text DEFAULT 'Active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create shifts table
CREATE TABLE IF NOT EXISTS shifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid REFERENCES staff(id) ON DELETE CASCADE NOT NULL,
  shift_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  department text NOT NULL,
  status text DEFAULT 'Scheduled',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_staff_department ON staff(department);
CREATE INDEX IF NOT EXISTS idx_staff_role ON staff(role);
CREATE INDEX IF NOT EXISTS idx_staff_status ON staff(status);
CREATE INDEX IF NOT EXISTS idx_shifts_staff_id ON shifts(staff_id);
CREATE INDEX IF NOT EXISTS idx_shifts_date ON shifts(shift_date);
CREATE INDEX IF NOT EXISTS idx_shifts_status ON shifts(status);

-- Enable Row Level Security
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for staff table

-- Allow authenticated users to read all staff records
CREATE POLICY "Authenticated users can view all staff"
  ON staff FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can insert staff records
CREATE POLICY "Admins can insert staff"
  ON staff FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Only admins can update staff records
CREATE POLICY "Admins can update staff"
  ON staff FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Only admins can delete staff records
CREATE POLICY "Admins can delete staff"
  ON staff FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- RLS Policies for shifts table

-- Allow authenticated users to read all shifts
CREATE POLICY "Authenticated users can view all shifts"
  ON shifts FOR SELECT
  TO authenticated
  USING (true);

-- Admins and managers can insert shifts
CREATE POLICY "Admins and managers can insert shifts"
  ON shifts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'manager')
    )
  );

-- Admins and managers can update shifts
CREATE POLICY "Admins and managers can update shifts"
  ON shifts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'manager')
    )
  );

-- Admins and managers can delete shifts
CREATE POLICY "Admins and managers can delete shifts"
  ON shifts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'manager')
    )
  );

-- Insert sample staff data
INSERT INTO staff (employee_id, full_name, role, department, email, phone, hire_date, status) VALUES
  ('EMP001', 'Dr. Sarah Johnson', 'Senior Doctor', 'Emergency', 'sarah.johnson@hospital.com', '555-0101', '2020-01-15', 'Active'),
  ('EMP002', 'Dr. Michael Chen', 'Doctor', 'Surgery', 'michael.chen@hospital.com', '555-0102', '2021-03-20', 'Active'),
  ('EMP003', 'Nurse Emily Davis', 'Senior Nurse', 'Pediatrics', 'emily.davis@hospital.com', '555-0103', '2019-06-10', 'Active'),
  ('EMP004', 'Nurse James Wilson', 'Nurse', 'Emergency', 'james.wilson@hospital.com', '555-0104', '2022-01-05', 'Active'),
  ('EMP005', 'Dr. Lisa Anderson', 'Department Head', 'Cardiology', 'lisa.anderson@hospital.com', '555-0105', '2018-09-01', 'Active'),
  ('EMP006', 'Nurse Robert Taylor', 'Nurse', 'Surgery', 'robert.taylor@hospital.com', '555-0106', '2021-11-15', 'Active'),
  ('EMP007', 'Dr. Amanda Martinez', 'Doctor', 'Pediatrics', 'amanda.martinez@hospital.com', '555-0107', '2020-08-22', 'Active'),
  ('EMP008', 'Technician David Brown', 'Lab Technician', 'Laboratory', 'david.brown@hospital.com', '555-0108', '2022-04-10', 'Active'),
  ('EMP009', 'Nurse Jennifer Lee', 'Senior Nurse', 'ICU', 'jennifer.lee@hospital.com', '555-0109', '2019-02-28', 'Active'),
  ('EMP010', 'Dr. Christopher Moore', 'Doctor', 'Emergency', 'christopher.moore@hospital.com', '555-0110', '2021-07-12', 'Active'),
  ('EMP011', 'Nurse Patricia White', 'Nurse', 'Cardiology', 'patricia.white@hospital.com', '555-0111', '2022-09-05', 'Active'),
  ('EMP012', 'Technician Mark Harris', 'Radiology Technician', 'Radiology', 'mark.harris@hospital.com', '555-0112', '2020-12-18', 'Active');

-- Insert sample shifts for today (showing mix of on-duty and off-duty staff)
-- Current time context: shifts are relative to now to show realistic duty status
INSERT INTO shifts (staff_id, shift_date, start_time, end_time, department, status) 
SELECT 
  id,
  CURRENT_DATE,
  '08:00:00'::time,
  '16:00:00'::time,
  department,
  'In Progress'
FROM staff WHERE employee_id IN ('EMP001', 'EMP003', 'EMP005', 'EMP008');

INSERT INTO shifts (staff_id, shift_date, start_time, end_time, department, status)
SELECT 
  id,
  CURRENT_DATE,
  '14:00:00'::time,
  '22:00:00'::time,
  department,
  'In Progress'
FROM staff WHERE employee_id IN ('EMP002', 'EMP004', 'EMP009');

INSERT INTO shifts (staff_id, shift_date, start_time, end_time, department, status)
SELECT 
  id,
  CURRENT_DATE,
  '20:00:00'::time,
  '04:00:00'::time,
  department,
  'Scheduled'
FROM staff WHERE employee_id IN ('EMP006', 'EMP007', 'EMP010', 'EMP011');

INSERT INTO shifts (staff_id, shift_date, start_time, end_time, department, status)
SELECT 
  id,
  CURRENT_DATE,
  '06:00:00'::time,
  '14:00:00'::time,
  department,
  'Completed'
FROM staff WHERE employee_id = 'EMP012';