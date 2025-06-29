import { Permission, UserPermissions } from '../types';

// Enhanced permissions with more granular control
export const DEFAULT_PERMISSIONS: UserPermissions = {
  admin: [
    'manage_users',
    'manage_doctors',
    'manage_patients',
    'manage_wards',
    'manage_inventory',
    'manage_appointments',
    'view_statistics',
    'manage_medical_records',
    'view_lab_results',
    'send_messages',
    'manage_prescriptions',
    'view_all_records',
    'manage_system'
  ],
  doctor: [
    'view_assigned_patients',
    'manage_patients',
    'manage_wards',
    'manage_medical_records',
    'create_prescriptions',
    'view_lab_results',
    'manage_appointments',
    'send_messages',
    'view_wards'
  ],
  patient: [
    'view_appointments',
    'view_personal_records',
    'send_messages',
    'book_appointments'
  ]
};

// Enhanced permission checking
export const hasPermission = (userPermissions: Permission[], requiredPermission: Permission): boolean => {
  // Admin has all permissions
  if (userPermissions.includes('manage_system')) return true;
  return userPermissions.includes(requiredPermission);
};

export const checkPermissions = (userPermissions: Permission[], requiredPermissions: Permission[]): boolean => {
  // Admin has all permissions
  if (userPermissions.includes('manage_system')) return true;
  return requiredPermissions.every(permission => hasPermission(userPermissions, permission));
};

// Helper to check if user can access specific patient data
export const canAccessPatientData = (
  userRole: string,
  userPermissions: Permission[],
  userId?: string,
  patientUserId?: string
): boolean => {
  if (userRole === 'admin') return true;
  if (userRole === 'doctor' && userPermissions.includes('view_assigned_patients')) return true;
  if (userRole === 'patient' && userId === patientUserId) return true;
  return false;
};

// Helper to check if user can manage medical records
export const canManageMedicalRecords = (
  userRole: string,
  userPermissions: Permission[],
  doctorId?: string,
  recordDoctorId?: string
): boolean => {
  if (userRole === 'admin') return true;
  if (userRole === 'doctor' && doctorId === recordDoctorId) return true;
  return false;
};