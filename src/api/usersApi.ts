const API_URL = 'http://localhost:5000/api/users';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'doctor' | 'patient';
  contactNumber: string;
}

// Get all users
export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await fetch(API_URL);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Get users by role
export const getUsersByRole = async (role: string): Promise<User[]> => {
  try {
    const response = await fetch(`${API_URL}?role=${role}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch users by role: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching users by role:', error);
    throw error;
  }
};

// Get a single user by ID
export const getUser = async (id: string): Promise<User> => {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};
