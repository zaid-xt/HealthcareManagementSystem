import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, Phone, BadgeCheck } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

const SignUpForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [doctorId, setDoctorId] = useState('');
  const [idNumber, setIdNumber] = useState(''); 
  const [contactNumber, setContactNumber] = useState(''); 
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    doctorId: '',
    idNumber: '', 
    contactNumber: '' 
  });
  
  const { register, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    let isValid = true;
    const errors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      doctorId: '',
      idNumber: '', 
      contactNumber: '' 
    };

    if (!name) {
      errors.name = 'Name is required';
      isValid = false;
    }

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
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    if (role === 'doctor' && !doctorId) {
      errors.doctorId = 'Doctor ID is required';
      isValid = false;
    }

     if (!idNumber) {
    errors.idNumber = 'ID Number is required';
    isValid = false;
  } else if (!/^\d{13}$/.test(idNumber)) {  
    errors.idNumber = 'ID Number must be exactly 13 digits';
    isValid = false;
  }

  if (!contactNumber) {
    errors.contactNumber = 'Contact Number is required';
    isValid = false;
  } else if (!/^\d{10}$/.test(contactNumber)) {  
    errors.contactNumber = 'Contact Number must be exactly 10 digits';
    isValid = false;
  }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const res = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          doctorId: role === "doctor" ? doctorId : null,
          idNumber, 
          contactNumber 
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert("Account created successfully!");
        navigate("/dashboard");
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
        <p className="mt-2 text-gray-600">Sign Up For A New Account</p>
      </div>
      
      {error && (
        <div className="p-3 text-sm rounded-md bg-red-50 text-red-600">
          {error}
        </div>
      )}
      
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={formErrors.name}
            placeholder="John Doe"
            leftIcon={<User className="h-4 w-4" />}
            fullWidth
            autoComplete="name"
          />
          
          <Input
            label="Email Address"
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
            autoComplete="new-password"
          />
          
          <Input
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={formErrors.confirmPassword}
            placeholder="••••••••"
            leftIcon={<Lock className="h-4 w-4" />}
            fullWidth
            autoComplete="new-password"
          />
          
        <Input
          label="ID Number"
          type="text"
          id="idNumber"
          value={idNumber}
          onChange={(e) => {
          const value = e.target.value.replace(/\D/g, '');
          setIdNumber(value);
        }}
          error={formErrors.idNumber}
          placeholder="13 digit number"
          leftIcon={<BadgeCheck className="h-4 w-4" />}
          fullWidth
          maxLength={13}
        />

      
        <Input
          label="Contact Number"
          type="tel"
          id="contactNumber"
          value={contactNumber}
          onChange={(e) => {
          const value = e.target.value.replace(/\D/g, '');
          setContactNumber(value);
          }}
          error={formErrors.contactNumber}
          placeholder="10 digit number"
          leftIcon={<Phone className="h-4 w-4" />}
          fullWidth
          maxLength={10} 
        />

          <div className="space-y-1.5">
            <label className="text-sm font-medium leading-none">Account Type</label>
            <div className="flex space-x-4 mt-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="role"
                  value="patient"
                  checked={role === 'patient'}
                  onChange={() => {
                    setRole('patient');
                    setDoctorId('');
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="text-sm">Patient</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="role"
                  value="doctor"
                  checked={role === 'doctor'}
                  onChange={() => setRole('doctor')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="text-sm">Doctor</span>
              </label>
            </div>
          </div>
          
          {role === 'doctor' && (
            <Input
              label="Doctor ID"
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              error={formErrors.doctorId}
              placeholder="e.g., DOC001"
              required
            />
          )}
        </div>
        
        <div className="flex items-center">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            required
          />
          <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
            I agree to the <a href="#" className="text-blue-600 hover:text-blue-500">Terms of Service</a> and <a href="#" className="text-blue-600 hover:text-blue-500">Privacy Policy</a>
          </label>
        </div>
        
        <div>
          <Button
            type="submit"
            fullWidth
            isLoading={isLoading}
            rightIcon={<UserPlus className="h-4 w-4" />}
          >
            Create Account
          </Button>
        </div>
      </form>
      
      <p className="mt-10 text-center text-sm text-gray-600">
        Already Have An Account?{' '}
        <button
          type="button"
          onClick={() => navigate('/signin')}
          className="font-medium text-blue-600 hover:text-blue-500"
        >
          Sign In
        </button>
      </p>
    </div>
  );
};

export default SignUpForm;