// Define all the types for our healthcare management system

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'doctor' | 'patient';
  avatar?: string;
  permissions?: string[];
  doctorId?: string;
  specialization?: string;
  idNumber: string;        
  contactNumber: string;   
}

export interface Patient {
  id: string;
  patientId: string;
  doctorId?: string;
  userId?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  contactNumber: string;
  email: string;
  address: string;
  status: 'active' | 'inactive' | 'pending' | 'discharged';
  emergencyContact: {
    name: string;
    relation: string;
    contactNumber: string;
  };
  insuranceDetails?: {
    provider: string;
    policyNumber: string;
    expiryDate: string;
  };
}

export interface Doctor {
  id: string;
  userId: string; // Reference to user
  firstName: string;
  lastName: string;
  specialization: string;
  department: string;
  contactNumber: string;
  email: string;
  licenseNumber: string;
  availability: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  type: 'regular' | 'follow-up' | 'emergency';
  notes?: string;
  createdBy: string; // User ID of admin who created the appointment
  createdAt?: string;
  updatedAt?: string;
  patientName?: string;
  doctorName?: string;
  createdByName?: string; // Added for display purposes
}

export interface Ward {
  id: string;
  name: string;
  type: 'general' | 'icu' | 'emergency' | 'maternity' | 'pediatric' | 'surgical';
  floorNumber: number;
  totalBeds: number;
  availableBeds: number;
  managedBy: string; // User ID of admin managing the ward
}

export interface Admittance {
  id: string;
  patientId: string;
  wardId: string;
  bedNumber: number;
  admissionDate: string;
  dischargeDate?: string;
  status: 'admitted' | 'discharged' | 'transferred';
  doctorId: string;
  reason: string;
  authorizedBy: string; // User ID of admin who authorized admission
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  diagnosis: string;
  symptoms: string[];
  treatment: string;
  notes: string;
  lastUpdated: string;
  lastUpdatedBy: string; // User ID of doctor who last updated the record
}

export interface Lab {
  id: string;
  patientId: string;
  doctorId: string;
  testType: string;
  date: string;
  results?: string;
  status: 'pending' | 'completed' | 'cancelled';
  reportUrl?: string;
  requestedBy: string; // User ID of doctor who requested the test
}

export interface Medicine {
  id: string;
  name: string;
  description: string;
  dosageForm: 'tablet' | 'capsule' | 'liquid' | 'injection' | 'topical' | 'inhaler';
  manufacturer: string;
  availableQuantity: number;
  unitPrice: number;
  expiryDate: string;
  lastUpdatedBy: string; // User ID of admin who last updated inventory
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  status: 'active' | 'completed' | 'cancelled';
  notes?: string;
  createdBy: string; // User ID of doctor who created prescription
}

export interface OrderLine {
  id: string;
  prescriptionId: string;
  medicineId: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  instructions: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  subject: string;
  content: string;
  timestamp: string;
  read: boolean;
  status: 'sent' | 'delivered' | 'read' | 'archived' | 'deleted';
  priority?: 'normal' | 'urgent';
  attachments?: {
    name: string;
    url: string;
  }[];
}

// Permission types for role-based access control
export type Permission =
  | 'manage_users'
  | 'manage_doctors'
  | 'manage_patients'
  | 'manage_wards'
  | 'manage_inventory'
  | 'manage_appointments'
  | 'view_statistics'
  | 'manage_medical_records'
  | 'create_prescriptions'
  | 'view_lab_results'
  | 'send_messages'
  | 'view_appointments'
  | 'view_personal_records';

export interface UserPermissions {
  admin: Permission[];
  doctor: Permission[];
  patient: Permission[];
}