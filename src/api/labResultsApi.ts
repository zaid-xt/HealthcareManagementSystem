import type { Lab } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

// Interface for API response that includes additional fields
export interface LabResultResponse extends Lab {
  patientName?: string;
  doctorName?: string;
  requestedByName?: string;
}

// Interface for filtering lab results
export interface LabResultFilters {
  patientId?: string;
  doctorId?: string;
  status?: 'pending' | 'completed' | 'cancelled';
  testType?: string;
  date?: string;
}

/**
 * Fetch all lab results with optional filtering
 */
export const fetchLabResults = async (filters?: LabResultFilters): Promise<LabResultResponse[]> => {
  const queryParams = new URLSearchParams();
  if (filters?.patientId) queryParams.append('patientId', filters.patientId);
  if (filters?.doctorId) queryParams.append('doctorId', filters.doctorId);
  if (filters?.status) queryParams.append('status', filters.status);
  if (filters?.testType) queryParams.append('testType', filters.testType);
  if (filters?.date) queryParams.append('date', filters.date);

  const url = `${API_BASE_URL}/lab-results${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch lab results: ${response.status} ${response.statusText} - ${errorText}`);
  }
  return response.json();
};

/**
 * Fetch a specific lab result by ID
 */
export const fetchLabResult = async (id: string): Promise<LabResultResponse> => {
  const response = await fetch(`${API_BASE_URL}/lab-results/${id}`);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch lab result: ${response.status} ${response.statusText} - ${errorText}`);
  }
  return response.json();
};

/**
 * Fetch lab results for a specific patient
 */
export const fetchLabResultsByPatient = async (patientId: string): Promise<LabResultResponse[]> => {
  const response = await fetch(`${API_BASE_URL}/lab-results/patient/${patientId}`);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch lab results for patient: ${response.status} ${response.statusText} - ${errorText}`);
  }
  return response.json();
};

/**
 * Create a new lab result
 */
export const createLabResult = async (labResult: Partial<Lab>): Promise<LabResultResponse> => {
  const response = await fetch(`${API_BASE_URL}/lab-results`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(labResult),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create lab result: ${response.status} ${response.statusText} - ${errorText}`);
  }
  return response.json();
};

/**
 * Update an existing lab result
 */
export const updateLabResult = async (id: string, labResult: Partial<Lab>): Promise<LabResultResponse> => {
  const response = await fetch(`${API_BASE_URL}/lab-results/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(labResult),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update lab result: ${response.status} ${response.statusText} - ${errorText}`);
  }
  return response.json();
};

/**
 * Delete a lab result
 */
export const deleteLabResult = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/lab-results/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete lab result: ${response.status} ${response.statusText} - ${errorText}`);
  }
};

// Export all functions as a single API object for convenience
export const labResultsApi = {
  getAll: fetchLabResults,
  getById: fetchLabResult,
  getByPatient: fetchLabResultsByPatient,
  create: createLabResult,
  update: updateLabResult,
  delete: deleteLabResult,
};