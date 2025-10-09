// patientsApi.ts
import type { Patient } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

export interface PatientUser {
  id: string;
  name: string;
  email: string;
  contactNumber: string;
  role: string;
  idNumber: string;
  doctorId?: string;
  created_at?: string;
  // Add additional fields that might be in your database
  dateOfBirth?: string;
  gender?: string;
  bloodType?: string;
  address?: string;
  emergencyContact?: {
    name: string;
    relation: string;
    contactNumber: string;
  };
}

export const fetchPatients = async (): Promise<PatientUser[]> => {
  try {
    console.log('🔄 Fetching patients from:', `${API_BASE_URL}/users?role=patient`);
    
    const response = await fetch(`${API_BASE_URL}/users?role=patient`);
    
    if (!response.ok) {
      console.error('❌ API response not OK:', response.status, response.statusText);
      throw new Error(`Failed to fetch patients: ${response.status} ${response.statusText}`);
    }
    
    const patients = await response.json();
    console.log('📋 Patients API Response:', patients);
    
    if (!Array.isArray(patients)) {
      console.error('❌ Expected array but got:', typeof patients, patients);
      throw new Error('Invalid response format: expected array of patients');
    }
    
    // Transform the data to ensure all fields are properly mapped
    return patients.map((patient: any) => ({
      id: patient.id?.toString() || `unknown-${Math.random()}`,
      name: patient.name || 'Unknown Name',
      email: patient.email || 'No email',
      contactNumber: patient.contactNumber || patient.contact_number || 'No phone',
      role: patient.role || 'patient',
      idNumber: patient.idNumber || patient.id_number || 'Not provided',
      doctorId: patient.doctorId,
      created_at: patient.created_at,
    }));
  } catch (error) {
    console.error('❌ Error in fetchPatients:', error);
    throw error;
  }
};

export const fetchPatient = async (id: string): Promise<PatientUser> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch patient: ${response.status} ${response.statusText}`);
    }
    
    const patient = await response.json();
    console.log('📋 Single Patient API Response:', patient);
    
    return {
      id: patient.id?.toString() || id,
      name: patient.name || 'Unknown Name',
      email: patient.email || 'No email',
      contactNumber: patient.contactNumber || patient.contact_number || 'No phone',
      role: patient.role || 'patient',
      idNumber: patient.idNumber || patient.id_number || 'Not provided',
      doctorId: patient.doctorId,
      created_at: patient.created_at,
    };
  } catch (error) {
    console.error('❌ Error in fetchPatient:', error);
    throw error;
  }
};

export const createPatient = async (patient: Omit<PatientUser, 'id'>): Promise<PatientUser> => {
  try {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...patient,
        role: 'patient'
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to create patient: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('❌ Error in createPatient:', error);
    throw error;
  }
};

export const updatePatient = async (id: string, patient: Partial<PatientUser>): Promise<PatientUser> => {
  try {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id,
        ...patient
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to update patient: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('❌ Error in updatePatient:', error);
    throw error;
  }
};

export const deletePatient = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/profile/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to delete patient: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Error in deletePatient:', error);
    throw error;
  }
};