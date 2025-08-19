const API_URL = 'http://localhost:5000/api/wards';

export async function fetchWards() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Failed to fetch wards');
  const data = await res.json();
  // Normalize id to string to align with frontend types
  return data.map((w: any) => ({
    ...w,
    id: String(w.id)
  }));
}

export async function addWard(ward: Record<string, any>) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ward)
  });
  if (!res.ok) throw new Error('Failed to add ward');
  const data = await res.json();
  return { ...data, id: String(data.id) };
}

export async function updateWard(id: string, ward: Record<string, any>) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ward)
  });
  if (!res.ok) throw new Error('Failed to update ward');
  const data = await res.json();
  return { ...data, id: String(data.id) };
}

export async function deleteWard(id: string) {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete ward');
  return res.json();
}


