import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Permission } from '../types';
import { users } from '../utils/mockData';
import { DEFAULT_PERMISSIONS } from '../utils/permissions';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, name: string, password: string, role: User['role']) => Promise<boolean>;
  logout: () => void;
  error: string | null;
  hasPermission: (permission: Permission) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      // Ensure user has current permissions
      parsedUser.permissions = DEFAULT_PERMISSIONS[parsedUser.role];
      setUser(parsedUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock authentication logic
      const foundUser = users.find(u => u.email === email);
      
      if (foundUser && password === 'password') { // In a real app, you'd verify password hash
        // Add permissions based on role
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
    role: User['role']
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user already exists
      const existingUser = users.find(u => u.email === email);
      
      if (existingUser) {
        setError('User with this email already exists');
        setIsLoading(false);
        return false;
      }
      
      // In a real app, you would send this data to your backend
      const newUser: User = {
        id: `user${users.length + 1}`,
        email,
        name,
        role,
        permissions: DEFAULT_PERMISSIONS[role]
      };
      
      // In this mock version, we just add it to our "database"
      users.push(newUser);
      
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
        hasPermission
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