import { 
  User, Patient, Doctor, Appointment, Ward, 
  Admittance, MedicalRecord, Lab, Medicine, 
  Prescription, OrderLine 
} from '../types';

// Mock Users
export const users: User[] = [
  {
    id: 'user1',
    email: 'admin@hospital.com',
    name: 'Admin User',
    role: 'admin',
    avatar: 'https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg?auto=compress&cs=tinysrgb&w=150'
  },
  {
    id: 'user2',
    email: 'doctor@hospital.com',
    name: 'Dr. Sarah Johnson',
    role: 'doctor',
    avatar: 'https://images.pexels.com/photos/5214962/pexels-photo-5214962.jpeg?auto=compress&cs=tinysrgb&w=150'
  },
  {
    id: 'user3',
    email: 'nurse@hospital.com',
    name: 'Nurse Robert Chen',
    role: 'nurse',
    avatar: 'https://images.pexels.com/photos/6129507/pexels-photo-6129507.jpeg?auto=compress&cs=tinysrgb&w=150'
  },
  {
    id: 'user4',
    email: 'patient@example.com',
    name: 'Jane Smith',
    role: 'patient',
    avatar: 'https://images.pexels.com/photos/5327656/pexels-photo-5327656.jpeg?auto=compress&cs=tinysrgb&w=150'
  }
];

// Mock Patients
export const patients: Patient[] = [
  {
    id: 'patient1',
    patientId: 'P001',
    userId: 'user4',
    doctorId: 'doctor1',
    firstName: 'Jane',
    lastName: 'Smith',
    dateOfBirth: '1985-06-15',
    gender: 'female',
    bloodType: 'A+',
    contactNumber: '555-1234',
    email: 'jane.smith@example.com',
    address: '123 Main St, Anytown, CA 94321',
    status: 'active',
    emergencyContact: {
      name: 'John Smith',
      relation: 'Husband',
      contactNumber: '555-5678'
    },
    insuranceDetails: {
      provider: 'Health Plus',
      policyNumber: 'HP123456',
      expiryDate: '2025-12-31'
    }
  },
  {
    id: 'patient2',
    patientId: 'P002',
    doctorId: 'doctor2',
    firstName: 'Michael',
    lastName: 'Johnson',
    dateOfBirth: '1972-03-21',
    gender: 'male',
    bloodType: 'O-',
    contactNumber: '555-8765',
    email: 'michael.johnson@example.com',
    address: '456 Oak Ave, Somecity, CA 94322',
    status: 'active',
    emergencyContact: {
      name: 'Lisa Johnson',
      relation: 'Wife',
      contactNumber: '555-9876'
    }
  },
  {
    id: 'patient3',
    patientId: 'P003',
    doctorId: 'doctor1',
    firstName: 'Emily',
    lastName: 'Chen',
    dateOfBirth: '1990-11-08',
    gender: 'female',
    bloodType: 'B+',
    contactNumber: '555-2468',
    email: 'emily.chen@example.com',
    address: '789 Pine St, Othertown, CA 94323',
    status: 'active',
    emergencyContact: {
      name: 'Wei Chen',
      relation: 'Father',
      contactNumber: '555-1357'
    },
    insuranceDetails: {
      provider: 'MediSecure',
      policyNumber: 'MS789012',
      expiryDate: '2025-10-15'
    }
  }
];

// Mock Doctors
export const doctors: Doctor[] = [
  {
    id: 'doctor1',
    userId: 'user2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    specialization: 'Cardiology',
    department: 'Cardiology',
    contactNumber: '555-4321',
    email: 'dr.sarah@hospital.com',
    licenseNumber: 'MD12345',
    availability: [
      { day: 'Monday', startTime: '09:00', endTime: '17:00' },
      { day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
      { day: 'Friday', startTime: '09:00', endTime: '13:00' }
    ]
  },
  {
    id: 'doctor2',
    userId: 'user5',
    firstName: 'James',
    lastName: 'Wilson',
    specialization: 'Neurology',
    department: 'Neurology',
    contactNumber: '555-8642',
    email: 'dr.wilson@hospital.com',
    licenseNumber: 'MD67890',
    availability: [
      { day: 'Tuesday', startTime: '08:00', endTime: '16:00' },
      { day: 'Thursday', startTime: '08:00', endTime: '16:00' },
      { day: 'Saturday', startTime: '10:00', endTime: '14:00' }
    ]
  }
];

// Mock Appointments
export const appointments: Appointment[] = [
  {
    id: 'appt1',
    patientId: 'patient1',
    doctorId: 'doctor1',
    date: '2025-06-15',
    startTime: '10:00',
    endTime: '10:30',
    status: 'scheduled',
    type: 'regular',
    notes: 'Follow-up on recent blood tests'
  },
  {
    id: 'appt2',
    patientId: 'patient2',
    doctorId: 'doctor2',
    date: '2025-06-16',
    startTime: '11:00',
    endTime: '11:30',
    status: 'scheduled',
    type: 'follow-up',
    notes: 'Review of MRI results'
  },
  {
    id: 'appt3',
    patientId: 'patient3',
    doctorId: 'doctor1',
    date: '2025-06-14',
    startTime: '09:30',
    endTime: '10:00',
    status: 'completed',
    type: 'regular'
  }
];

// Mock Wards
export const wards: Ward[] = [
  {
    id: 'ward1',
    name: 'General Ward A',
    type: 'general',
    floorNumber: 2,
    totalBeds: 20,
    availableBeds: 7
  },
  {
    id: 'ward2',
    name: 'ICU',
    type: 'icu',
    floorNumber: 3,
    totalBeds: 10,
    availableBeds: 2
  },
  {
    id: 'ward3',
    name: 'Maternity Ward',
    type: 'maternity',
    floorNumber: 4,
    totalBeds: 15,
    availableBeds: 6
  }
];

// Mock Admittances
export const admittances: Admittance[] = [
  {
    id: 'adm1',
    patientId: 'patient1',
    wardId: 'ward1',
    bedNumber: 5,
    admissionDate: '2025-06-10',
    status: 'admitted',
    doctorId: 'doctor1',
    reason: 'Post-operative recovery'
  },
  {
    id: 'adm2',
    patientId: 'patient2',
    wardId: 'ward2',
    bedNumber: 3,
    admissionDate: '2025-06-12',
    status: 'admitted',
    doctorId: 'doctor2',
    reason: 'Stroke monitoring'
  }
];

// Mock Medical Records
export const medicalRecords: MedicalRecord[] = [
  {
    id: 'rec1',
    patientId: 'patient1',
    doctorId: 'doctor1',
    date: '2025-06-01',
    diagnosis: 'Hypertension',
    symptoms: ['Headache', 'Dizziness', 'Fatigue'],
    treatment: 'Prescribed Lisinopril 10mg daily',
    notes: 'Patient to monitor blood pressure daily and return in 2 weeks'
  },
  {
    id: 'rec2',
    patientId: 'patient2',
    doctorId: 'doctor2',
    date: '2025-06-05',
    diagnosis: 'Migraines',
    symptoms: ['Severe headache', 'Visual aura', 'Nausea'],
    treatment: 'Sumatriptan as needed for acute attacks',
    notes: 'Recommended lifestyle modifications to identify triggers'
  }
];

// Mock Lab Results
export const labs: Lab[] = [
  {
    id: 'lab1',
    patientId: 'patient1',
    doctorId: 'doctor1',
    testType: 'Complete Blood Count',
    date: '2025-06-05',
    results: 'WBC: 7.5, RBC: 4.8, Hemoglobin: 14.2, Hematocrit: 42%',
    status: 'completed'
  },
  {
    id: 'lab2',
    patientId: 'patient2',
    doctorId: 'doctor2',
    testType: 'MRI Brain',
    date: '2025-06-14',
    status: 'pending'
  }
];

// Mock Medicines
export const medicines: Medicine[] = [
  {
    id: 'med1',
    name: 'Lisinopril',
    description: 'ACE inhibitor for hypertension',
    dosageForm: 'tablet',
    manufacturer: 'PharmaCorp',
    availableQuantity: 500,
    unitPrice: 0.85
  },
  {
    id: 'med2',
    name: 'Sumatriptan',
    description: 'For acute migraine treatment',
    dosageForm: 'tablet',
    manufacturer: 'MediHealth',
    availableQuantity: 200,
    unitPrice: 12.50
  },
  {
    id: 'med3',
    name: 'Amoxicillin',
    description: 'Antibiotic for bacterial infections',
    dosageForm: 'capsule',
    manufacturer: 'GeneriCo',
    availableQuantity: 350,
    unitPrice: 0.65
  }
];

// Mock Prescriptions
export const prescriptions: Prescription[] = [
  {
    id: 'presc1',
    patientId: 'patient1',
    doctorId: 'doctor1',
    date: '2025-06-01',
    status: 'active',
    notes: 'For blood pressure management'
  },
  {
    id: 'presc2',
    patientId: 'patient2',
    doctorId: 'doctor2',
    date: '2025-06-05',
    status: 'active',
    notes: 'For migraine management'
  }
];

// Mock Order Lines
export const orderLines: OrderLine[] = [
  {
    id: 'order1',
    prescriptionId: 'presc1',
    medicineId: 'med1',
    dosage: '10mg',
    frequency: 'Once daily',
    duration: '30 days',
    quantity: 30,
    instructions: 'Take in the morning with water'
  },
  {
    id: 'order2',
    prescriptionId: 'presc2',
    medicineId: 'med2',
    dosage: '50mg',
    frequency: 'As needed',
    duration: '30 days',
    quantity: 9,
    instructions: 'Take at onset of migraine. Do not exceed 9 tablets per month'
  }
];