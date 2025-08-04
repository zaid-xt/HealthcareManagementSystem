import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Permission } from '../types';
import { users } from '../utils/mockData';
import { DEFAULT_PERMISSIONS } from '../utils/permissions';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, name: string, password: string, role: User['role'], additionalInfo?: { doctorId?: string; specialization?: string }) => Promise<boolean>;
  logout: () => void;
  error: string | null;
  hasPermission: (permission: Permission) => boolean;
  updateProfile: (updatedUser: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      parsedUser.permissions = DEFAULT_PERMISSIONS[parsedUser.role];
      setUser(parsedUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const foundUser = users.find(u => u.email === email);
      
      if (foundUser && password === 'password') {
        const userWithPermissions = {
          ...foundUser,
          permissions: DEFAULT_PERMISSIONS[foundUser.role]
        };
        setUser(userWithPermissions);
        localStorage.setItem('user', JSON.stringify(userWithPermissions));
        setIsLoading(false);
        return true;
      } else {
        setError('Invalid email or password');
        setIsLoading(false);
        return false;
      }
    } catch (err) {
      setError('An error occurred during login');
      setIsLoading(false);
      return false;
    }
  };

  const register = async (
    email: string, 
    name: string, 
    password: string, 
    role: User['role'],
    additionalInfo?: { doctorId?: string; specialization?: string }
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const existingUser = users.find(u => u.email === email);
      
      if (existingUser) {
        setError('User with this email already exists');
        setIsLoading(false);
        return false;
      }
      
      const newUser: User = {
        id: `user${users.length + 1}`,
        email,
        name,
        role,
        permissions: DEFAULT_PERMISSIONS[role],
        doctorId: additionalInfo?.doctorId,
        specialization: additionalInfo?.specialization
      };
      
      users.push(newUser);
      
      // If registering as a doctor, also create a doctor record
      if (role === 'doctor' && additionalInfo?.doctorId && additionalInfo?.specialization) {
        const { doctors } = await import('../utils/mockData');
        const [firstName, ...lastNameParts] = name.split(' ');
        const lastName = lastNameParts.join(' ') || '';
        
        const newDoctor = {
          id: additionalInfo.doctorId,
          userId: newUser.id,
          firstName,
          lastName,
          specialization: additionalInfo.specialization,
          department: additionalInfo.specialization,
          contactNumber: '',
          email,
          licenseNumber: additionalInfo.doctorId,
          availability: []
        };
        
        doctors.push(newDoctor);
      }
      
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      setIsLoading(false);
      return true;
    } catch (err) {
      setError('An error occurred during registration');
      setIsLoading(false);
      return false;
    }
  };

  const updateProfile = async (updatedUser: User): Promise<void> => {
    try {
      // In a real app, this would make an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the user in the "database"
      const userIndex = users.findIndex(u => u.id === updatedUser.id);
      if (userIndex !== -1) {
        users[userIndex] = updatedUser;
      }
      
      // Update local state and storage
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      throw new Error('Failed to update profile');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        error,
        hasPermission,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};