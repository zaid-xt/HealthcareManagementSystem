import React, { useState } from 'react';
import { Save, X } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import type { Doctor } from '../../types';

interface AddDoctorFormProps {
  onSave: (doctor: Omit<Doctor, 'id' | 'userId'>) => void;
  onCancel: () => void;
}

const AddDoctorForm: React.FC<AddDoctorFormProps> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    specialization: '',
    department: '',
    contactNumber: '',
    email: '',
    licenseNumber: '',
    availability: [
      { day: 'Monday', startTime: '09:00', endTime: '17:00' }
    ]
  });

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    specialization: '',
    department: '',
    contactNumber: '',
    email: '',
    licenseNumber: ''
  });

  const validateForm = () => {
    const newErrors = {
      firstName: '',
      lastName: '',
      specialization: '',
      department: '',
      contactNumber: '',
      email: '',
      licenseNumber: ''
    };
    let isValid = true;

    if (!formData.firstName) {
      newErrors.firstName = 'First name is required';
      isValid = false;
    }

    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required';
      isValid = false;
    }

    if (!formData.specialization) {
      newErrors.specialization = 'Specialization is required';
      isValid = false;
    }

    if (!formData.department) {
      newErrors.department = 'Department is required';
      isValid = false;
    }

    if (!formData.contactNumber) {
      newErrors.contactNumber = 'Contact number is required';
      isValid = false;
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
      isValid = false;
    }

    if (!formData.licenseNumber) {
      newErrors.licenseNumber = 'License number is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="First Name"
          value={formData.firstName}
          onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
          error={errors.firstName}
          required
        />
        
        <Input
          label="Last Name"
          value={formData.lastName}
          onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
          error={errors.lastName}
          required
        />
        
        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          error={errors.email}
          required
        />
        
        <Input
          label="Contact Number"
          value={formData.contactNumber}
          onChange={(e) => setFormData(prev => ({ ...prev, contactNumber: e.target.value }))}
          error={errors.contactNumber}
          required
        />
        
        <Input
          label="License Number"
          value={formData.licenseNumber}
          onChange={(e) => setFormData(prev => ({ ...prev, licenseNumber: e.target.value }))}
          error={errors.licenseNumber}
          required
        />
        
        <Input
          label="Specialization"
          value={formData.specialization}
          onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
          error={errors.specialization}
          required
        />
        
        <Input
          label="Department"
          value={formData.department}
          onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
          error={errors.department}
          required
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Availability</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
            <select
              value={formData.availability[0].day}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                availability: [{ ...prev.availability[0], day: e.target.value }]
              }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
              <option value="Sunday">Sunday</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
            <input
              type="time"
              value={formData.availability[0].startTime}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                availability: [{ ...prev.availability[0], startTime: e.target.value }]
              }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
            <input
              type="time"
              value={formData.availability[0].endTime}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                availability: [{ ...prev.availability[0], endTime: e.target.value }]
              }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          leftIcon={<X className="h-4 w-4" />}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          leftIcon={<Save className="h-4 w-4" />}
        >
          Add Doctor
        </Button>
      </div>
    </form>
  );
};

export default AddDoctorForm;