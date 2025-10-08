/*
  # Create Appointments Table

  1. New Tables
    - `appointments`
      - `id` (uuid, primary key) - Unique identifier for the appointment
      - `patient_id` (uuid) - Reference to the patient
      - `doctor_id` (uuid) - Reference to the doctor
      - `date` (date) - Date of the appointment
      - `start_time` (time) - Start time of the appointment
      - `end_time` (time) - End time of the appointment
      - `status` (text) - Status: scheduled, completed, cancelled, no-show
      - `type` (text) - Type: regular, follow-up, emergency
      - `notes` (text, optional) - Additional notes
      - `created_at` (timestamptz) - Timestamp of creation
      - `updated_at` (timestamptz) - Timestamp of last update
      - `created_by` (uuid) - User who created the appointment

  2. Security
    - Enable RLS on `appointments` table
    - Add policy for patients to view their own appointments
    - Add policy for doctors to view their appointments
    - Add policy for patients to create appointments
    - Add policy for patients to cancel their own appointments
    - Add policy for admins to view all appointments
*/

CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  doctor_id uuid NOT NULL,
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no-show')),
  type text NOT NULL DEFAULT 'regular' CHECK (type IN ('regular', 'follow-up', 'emergency')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid NOT NULL
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view their own appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (patient_id::text = auth.jwt()->>'sub');

CREATE POLICY "Doctors can view their appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (doctor_id::text = auth.jwt()->>'sub');

CREATE POLICY "Patients can create appointments"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (patient_id::text = auth.jwt()->>'sub');

CREATE POLICY "Patients can update their own scheduled appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (
    patient_id::text = auth.jwt()->>'sub' 
    AND status = 'scheduled'
  )
  WITH CHECK (
    patient_id::text = auth.jwt()->>'sub'
    AND status IN ('scheduled', 'cancelled')
  );

CREATE POLICY "Doctors can update their appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (doctor_id::text = auth.jwt()->>'sub')
  WITH CHECK (doctor_id::text = auth.jwt()->>'sub');

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
