import { getUsersByRole, type User } from './usersApi';

export interface Doctor {
  id: string;
  name: string;
  email: string;
  contactNumber: string;
}

export const fetchDoctors = async (): Promise<Doctor[]> => {
  try {
    const users = await getUsersByRole('doctor');
    // Just return the basic user info - no transformation needed
    return users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      contactNumber: user.contactNumber
    }));
  } catch (error) {
    console.error('Error fetching doctors:', error);
    throw new Error('Failed to load doctors list');
  }
};