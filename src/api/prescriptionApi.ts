const API_BASE_URL = 'http://localhost:5000/api';

export interface Medicine {
  id: string;
  name: string;
  dosageForm: string;
  strength?: string;
  description?: string;
}

export interface OrderLine {
  id?: string;
  medicineId: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  instructions: string;
  medicineName?: string;
  dosageForm?: string;
  strength?: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  status: 'active' | 'completed' | 'cancelled';
  notes: string;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
  patientName?: string;
  patientIdNumber?: string;
  patientContact?: string;
  patientEmail?: string;
  doctorName?: string;
  specialization?: string;
  department?: string;
  doctorContact?: string;
  createdByName?: string;
  medications: OrderLine[];
}

export interface CreatePrescriptionData {
  patientId: string;
  doctorId: string;
  date: string;
  status: 'active' | 'completed' | 'cancelled';
  notes: string;
  createdBy: string;
  medications: Omit<OrderLine, 'id'>[];
}

export interface UpdatePrescriptionData {
  patientId: string;
  doctorId: string;
  date: string;
  status: 'active' | 'completed' | 'cancelled';
  notes: string;
  medications: OrderLine[];
}

export interface PrescriptionFilters {
  patientId?: string;
  doctorId?: string;
  status?: string;
}

class PrescriptionAPI {
  private async fetchApi(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    return response.json();
  }

  // Medicines
  async getMedicines(): Promise<Medicine[]> {
    return this.fetchApi('/medicines');
  }

  // Prescriptions
  async getPrescriptions(filters?: PrescriptionFilters): Promise<Prescription[]> {
    const queryParams = new URLSearchParams();
    if (filters?.patientId) queryParams.append('patientId', filters.patientId);
    if (filters?.doctorId) queryParams.append('doctorId', filters.doctorId);
    if (filters?.status) queryParams.append('status', filters.status);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/prescriptions?${queryString}` : '/prescriptions';
    
    return this.fetchApi(endpoint);
  }

  async getPrescription(id: string): Promise<Prescription> {
    return this.fetchApi(`/prescriptions/${id}`);
  }

  async createPrescription(data: CreatePrescriptionData): Promise<Prescription> {
    const prescriptionId = `presc${Date.now()}`;
    
    return this.fetchApi('/prescriptions', {
      method: 'POST',
      body: JSON.stringify({
        id: prescriptionId,
        ...data
      }),
    });
  }

  async updatePrescription(id: string, data: UpdatePrescriptionData): Promise<Prescription> {
    return this.fetchApi(`/prescriptions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePrescription(id: string): Promise<{ message: string }> {
    return this.fetchApi(`/prescriptions/${id}`, {
      method: 'DELETE',
    });
  }

  // Users
  async getPatients(): Promise<any[]> {
    return this.fetchApi('/patients');
  }

  async getDoctors(): Promise<any[]> {
    return this.fetchApi('/doctors');
  }
}

export const prescriptionAPI = new PrescriptionAPI();