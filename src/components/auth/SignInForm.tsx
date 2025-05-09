import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

const SignInForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState({ email: '', password: '' });
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    let isValid = true;
    const errors = { email: '', password: '' };

    if (!email) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }

    if (!password) {
      errors.password = 'Password is required';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const success = await login(email, password);
    if (success) {
      navigate('/dashboard');
    }
  };

  // Use these demo accounts in a real app, you would remove this
  const handleDemoUser = async (userType: 'admin' | 'doctor' | 'patient') => {
    let email = '';
    
    switch (userType) {
      case 'admin':
        email = 'admin@hospital.com';
        break;
      case 'doctor':
        email = 'doctor@hospital.com';
        break;
      case 'patient':
        email = 'patient@example.com';
        break;
    }
    
    const success = await login(email, 'password');
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
        <p className="mt-2 text-gray-600">Sign in to your account</p>
      </div>
      
      {error && (
        <div className="p-3 text-sm rounded-md bg-red-50 text-red-600">
          {error}
        </div>
      )}
      
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <Input
            label="Email address"
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={formErrors.email}
            placeholder="you@example.com"
            leftIcon={<Mail className="h-4 w-4" />}
            fullWidth
            autoComplete="email"
          />
          
          <Input
            label="Password"
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={formErrors.password}
            placeholder="••••••••"
            leftIcon={<Lock className="h-4 w-4" />}
            fullWidth
            autoComplete="current-password"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
              Remember me
            </label>
          </div>
          
          <button
            type="button"
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Forgot your password?
          </button>
        </div>
        
        <div>
          <Button
            type="submit"
            fullWidth
            isLoading={isLoading}
            rightIcon={<LogIn className="h-4 w-4" />}
          >
            Sign in
          </Button>
        </div>
      </form>
      
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or sign in with</span>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-3 gap-3">
          <Button
            variant="outline"
            type="button"
            fullWidth
            onClick={() => handleDemoUser('admin')}
          >
            Admin
          </Button>
          <Button
            variant="outline"
            type="button"
            fullWidth
            onClick={() => handleDemoUser('doctor')}
          >
            Doctor
          </Button>
          <Button
            variant="outline"
            type="button"
            fullWidth
            onClick={() => handleDemoUser('patient')}
          >
            Patient
          </Button>
        </div>
      </div>
      
      <p className="mt-10 text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={() => navigate('/signup')}
          className="font-medium text-blue-600 hover:text-blue-500"
        >
          Sign up
        </button>
      </p>
    </div>
  );
};

export default SignInForm;