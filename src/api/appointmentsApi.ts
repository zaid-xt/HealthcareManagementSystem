import type { Appointment } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

export const fetchAppointments = async (filters?: {
  patientId?: string;
  doctorId?: string;
  status?: string;
  date?: string;
}): Promise<Appointment[]> => {
  const queryParams = new URLSearchParams();
  if (filters?.patientId) queryParams.append('patientId', filters.patientId);
  if (filters?.doctorId) queryParams.append('doctorId', filters.doctorId);
  if (filters?.status) queryParams.append('status', filters.status);
  if (filters?.date) queryParams.append('date', filters.date);

  const url = `${API_BASE_URL}/appointments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch appointments');
  }
  return response.json();
};

export const fetchAppointment = async (id: string): Promise<Appointment> => {
  const response = await fetch(`${API_BASE_URL}/appointments/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch appointment');
  }
  return response.json();
};

export const createAppointment = async (appointment: Partial<Appointment>): Promise<Appointment> => {
  const response = await fetch(`${API_BASE_URL}/appointments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(appointment),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create appointment');
  }
  return response.json();
};

export const updateAppointment = async (id: string, appointment: Partial<Appointment>): Promise<Appointment> => {
  const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(appointment),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update appointment');
  }
  return response.json();
};

export const deleteAppointment = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete appointment');
  }
};