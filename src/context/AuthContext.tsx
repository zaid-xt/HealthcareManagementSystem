import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Permission } from '../types';
import { DEFAULT_PERMISSIONS } from '../utils/permissions';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    email: string,
    name: string,
    password: string,
    role: User['role'],
    additionalInfo?: { doctorId?: string }
  ) => Promise<boolean>;
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
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login failed');
        setIsLoading(false);
        return false;
      }

      // Add permissions from your permissions map
      data.user.permissions = DEFAULT_PERMISSIONS[data.user.role];

      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      setIsLoading(false);
      return true;
    } catch (err) {
      setError('Network error during login');
      setIsLoading(false);
      return false;
    }
  };

  const register = async (
    email: string,
    name: string,
    password: string,
    role: User['role'],
    additionalInfo?: { doctorId?: string }
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          doctorId: role === 'doctor' ? additionalInfo?.doctorId : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Registration failed');
        setIsLoading(false);
        return false;
      }

      // Optionally auto-login after successful registration:
      // return await login(email, password);

      setIsLoading(false);
      return true;
    } catch (err) {
      setError('Network error during registration');
      setIsLoading(false);
      return false;
    }
  };

 // Update the updateProfile function in AuthContext.tsx
const updateProfile = async (updatedUser: User): Promise<void> => {
  setIsLoading(true);
  setError(null);

  try {
    const response = await fetch('http://localhost:5000/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: user?.id,
        name: updatedUser.name,
        email: updatedUser.email,
        doctorId: updatedUser.doctorId,
        role: user?.role
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || 'Profile update failed');
      setIsLoading(false);
      throw new Error(data.message || 'Profile update failed');
    }

    // Update local state and storage
    const newUser = { ...user, ...updatedUser };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    setIsLoading(false);
  } catch (err) {
    setError('Network error during profile update');
    setIsLoading(false);
    throw err;
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
        updateProfile,
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
