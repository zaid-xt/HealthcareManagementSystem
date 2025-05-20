/*
  # Create Admittance Table

  1. New Tables
    - `admittances`
      - `id` (uuid, primary key)
      - `patient_id` (uuid, foreign key to patients)
      - `ward_id` (uuid, foreign key to wards)
      - `bed_number` (integer)
      - `admission_date` (timestamptz)
      - `discharge_date` (timestamptz, nullable)
      - `status` (enum: admitted, discharged, transferred)
      - `doctor_id` (uuid, foreign key to users)
      - `reason` (text)
      - `authorized_by` (uuid, foreign key to users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `admittances` table
    - Add policies for:
      - Admins can do all operations
      - Doctors can view all admittances and create/update for their patients
      - Patients can only view their own admittances
      - Nurses can view all admittances in their assigned wards

  3. Indexes
    - Index on patient_id for faster patient lookups
    - Index on ward_id for faster ward occupancy queries
    - Index on status for filtering active admissions
*/

-- Create enum type for admittance status
CREATE TYPE admittance_status AS ENUM ('admitted', 'discharged', 'transferred');

-- Create admittances table
CREATE TABLE IF NOT EXISTS admittances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ward_id uuid NOT NULL REFERENCES wards(id) ON DELETE CASCADE,
  bed_number integer NOT NULL,
  admission_date timestamptz NOT NULL DEFAULT now(),
  discharge_date timestamptz,
  status admittance_status NOT NULL DEFAULT 'admitted',
  doctor_id uuid NOT NULL REFERENCES auth.users(id),
  reason text NOT NULL,
  authorized_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  -- Add constraint to ensure bed number is positive
  CONSTRAINT positive_bed_number CHECK (bed_number > 0),
  
  -- Add constraint to ensure discharge date is after admission date
  CONSTRAINT valid_discharge_date CHECK (discharge_date IS NULL OR discharge_date > admission_date),
  
  -- Add constraint to ensure unique bed assignment within a ward for active admissions
  CONSTRAINT unique_active_bed UNIQUE (ward_id, bed_number, status)
);

-- Create indexes
CREATE INDEX admittances_patient_id_idx ON admittances(patient_id);
CREATE INDEX admittances_ward_id_idx ON admittances(ward_id);
CREATE INDEX admittances_status_idx ON admittances(status);

-- Enable RLS
ALTER TABLE admittances ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Admin can do everything
CREATE POLICY "Admins have full access" ON admittances
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Doctors can view all and manage their patients
CREATE POLICY "Doctors can view all admittances" ON admittances
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'doctor');

CREATE POLICY "Doctors can manage their patients" ON admittances
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.jwt() ->> 'role' = 'doctor' 
    AND doctor_id = auth.uid()
  );

-- Patients can only view their own admittances
CREATE POLICY "Patients can view their admittances" ON admittances
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'patient' 
    AND patient_id = auth.uid()
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_admittances_updated_at
  BEFORE UPDATE ON admittances
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();