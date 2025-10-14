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
    idNumber: string,     
    contactNumber: string,
    additionalInfo?: { doctorId?: string },
  ) => Promise<boolean>;
  logout: () => void;
  error: string | null;
  hasPermission: (permission: Permission) => boolean;
  updateProfile: (updatedUser: User) => Promise<void>;
  deleteProfile: () => Promise<void>;
  getDefaultRoute: (user?: User) => string; // Updated to accept optional user parameter
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    console.log('🔍 Checking stored user on init:', storedUser);
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('✅ Loaded user from storage:', parsedUser.email, parsedUser.role);
        parsedUser.permissions = DEFAULT_PERMISSIONS[parsedUser.role];
        setUser(parsedUser);
      } catch (error) {
        console.error('❌ Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    } else {
      console.log('📭 No stored user found');
    }
    setIsLoading(false);
  }, []);

  // Updated getDefaultRoute to accept optional user parameter
  const getDefaultRoute = (currentUser?: User): string => {
    const targetUser = currentUser || user;
    
    if (!targetUser) {
      console.log('🚫 getDefaultRoute: No user, redirecting to signin');
      return '/signin';
    }
    
    console.log('🎯 getDefaultRoute: Determining route for role:', targetUser.role);
    
    switch (targetUser.role) {
      case 'admin':
        return '/dashboard';
      case 'doctor':
        return '/dashboard';
      case 'patient':
        return '/welcome';
      default:
        console.log('❓ getDefaultRoute: Unknown role, redirecting to signin');
        return '/signin';
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 Attempting login for:', email);
      
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('📋 Login response:', data);

      if (!response.ok) {
        setError(data.message || 'Login failed');
        setIsLoading(false);
        return false;
      }

      // Add permissions to user data
      data.user.permissions = DEFAULT_PERMISSIONS[data.user.role];
      console.log('✅ Login successful, setting user:', data.user);
      
      // Update state and storage
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Get redirect route using the NEW user data (not the old state)
      const defaultRoute = getDefaultRoute(data.user);
      console.log('🚀 Redirecting to:', defaultRoute);
      
      setIsLoading(false);
      
      // Use setTimeout to ensure state is updated before redirect
      setTimeout(() => {
        window.location.href = defaultRoute;
      }, 100);
      
      return true;
    } catch (err) {
      console.error('❌ Login error:', err);
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
    idNumber: string,
    contactNumber: string,
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
          idNumber,
          contactNumber,
          doctorId: role === 'doctor' ? additionalInfo?.doctorId : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Registration failed');
        setIsLoading(false);
        return false;
      }

      setIsLoading(false);
      return true;
    } catch (err) {
      setError('Network error during registration');
      setIsLoading(false);
      return false;
    }
  };

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
          idNumber: updatedUser.idNumber,
          contactNumber: updatedUser.contactNumber,
          role: user?.role
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Profile update failed');
        setIsLoading(false);
        throw new Error(data.message || 'Profile update failed');
      }

      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));

      setIsLoading(false);
    } catch (err) {
      setError('Network error during profile update');
      setIsLoading(false);
      throw err;
    }
  };

  const deleteProfile = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:5000/api/profile/${user?.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Profile deletion failed');
        setIsLoading(false);
        throw new Error(data.message || 'Profile deletion failed');
      }

      logout();
    } catch (err) {
      setError('Network error during profile deletion');
      setIsLoading(false);
      throw err;
    }
  };

  const logout = () => {
    console.log('👋 Logging out user');
    setUser(null);
    localStorage.removeItem('user');
    window.location.href = '/signin';
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
        deleteProfile,
        getDefaultRoute,
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