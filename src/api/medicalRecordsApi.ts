const API_URL = 'http://localhost:5000/api/medical-records';

// Update fetchMedicalRecords to accept doctorId
export async function fetchMedicalRecords(doctorId?: string) {
  const url = doctorId 
    ? `http://localhost:5000/api/medical-records/doctor/${doctorId}`
    : 'http://localhost:5000/api/medical-records';
    
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch records');
  return res.json();
}

export async function addMedicalRecord(record: Record<string, any>) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(record),
  });
  if (!res.ok) throw new Error('Failed to add record');
  return res.json();
}

export async function updateMedicalRecord(id: string, record: Record<string, any>) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(record),
  });
  if (!res.ok) throw new Error('Failed to update record');
  return res.json();
}

export async function deleteMedicalRecord(id: string) {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete record');
  return res.json();
}
