const API_URL = 'http://localhost:5000/api';

export interface PrescriptionData {
  patientId: string;
  doctorId: string;
  date: string;
  status: string;
  notes?: string;
  medications: {
    medicineId: string;
    dosage: string;
    frequency: string;
    duration: string;
    quantity: number;
    instructions?: string;
  }[];
}

export async function fetchPrescriptions() {
  const res = await fetch(`${API_URL}/prescriptions`);
  if (!res.ok) throw new Error('Failed to fetch prescriptions');
  return res.json();
}

export async function fetchPrescriptionById(id: string) {
  const res = await fetch(`${API_URL}/prescriptions/${id}`);
  if (!res.ok) throw new Error('Failed to fetch prescription');
  return res.json();
}

export async function createPrescription(prescription: PrescriptionData) {
  const res = await fetch(`${API_URL}/prescriptions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prescription),
  });
  if (!res.ok) throw new Error('Failed to create prescription');
  return res.json();
}

export async function updatePrescription(id: string, prescription: PrescriptionData) {
  const res = await fetch(`${API_URL}/prescriptions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prescription),
  });
  if (!res.ok) throw new Error('Failed to update prescription');
  return res.json();
}

export async function deletePrescription(id: string) {
  const res = await fetch(`${API_URL}/prescriptions/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete prescription');
  return res.json();
}

export async function fetchMedicines() {
  const res = await fetch(`${API_URL}/medicines`);
  if (!res.ok) throw new Error('Failed to fetch medicines');
  return res.json();
}

export async function fetchDoctors() {
  const res = await fetch(`${API_URL}/doctors`);
  if (!res.ok) throw new Error('Failed to fetch doctors');
  return res.json();
}