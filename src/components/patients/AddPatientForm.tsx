import React, { useState } from 'react';
import { Save, X } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import type { Patient } from '../../types';

interface AddPatientFormProps {
  onSave: (patient: Omit<Patient, 'id'>) => void;
  onCancel: () => void;
}

const AddPatientForm: React.FC<AddPatientFormProps> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    patientId: `P${String(Date.now()).slice(-3)}`,
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'male' as Patient['gender'],
    bloodType: '' as Patient['bloodType'],
    contactNumber: '',
    email: '',
    address: '',
    status: 'active' as Patient['status'],
    emergencyContact: {
      name: '',
      relation: '',
      contactNumber: ''
    }
  });

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    contactNumber: '',
    email: '',
    address: '',
    emergencyContactName: '',
    emergencyContactNumber: ''
  });

  const validateForm = () => {
    const newErrors = {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      contactNumber: '',
      email: '',
      address: '',
      emergencyContactName: '',
      emergencyContactNumber: ''
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

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
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

    if (!formData.address) {
      newErrors.address = 'Address is required';
      isValid = false;
    }

    if (!formData.emergencyContact.name) {
      newErrors.emergencyContactName = 'Emergency contact name is required';
      isValid = false;
    }

    if (!formData.emergencyContact.contactNumber) {
      newErrors.emergencyContactNumber = 'Emergency contact number is required';
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
          label="Patient ID"
          value={formData.patientId}
          onChange={(e) => setFormData(prev => ({ ...prev, patientId: e.target.value }))}
          required
          disabled
        />
        
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
          label="Date of Birth"
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
          error={errors.dateOfBirth}
          required
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
          <select
            value={formData.gender}
            onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as Patient['gender'] }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
          <select
            value={formData.bloodType}
            onChange={(e) => setFormData(prev => ({ ...prev, bloodType: e.target.value as Patient['bloodType'] }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Unknown</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>
        
        <Input
          label="Contact Number"
          value={formData.contactNumber}
          onChange={(e) => setFormData(prev => ({ ...prev, contactNumber: e.target.value }))}
          error={errors.contactNumber}
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Patient['status'] }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
            <option value="discharged">Discharged</option>
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
        <textarea
          value={formData.address}
          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
        {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Name"
            value={formData.emergencyContact.name}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              emergencyContact: { ...prev.emergencyContact, name: e.target.value }
            }))}
            error={errors.emergencyContactName}
            required
          />
          
          <Input
            label="Relation"
            value={formData.emergencyContact.relation}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              emergencyContact: { ...prev.emergencyContact, relation: e.target.value }
            }))}
          />
          
          <Input
            label="Contact Number"
            value={formData.emergencyContact.contactNumber}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              emergencyContact: { ...prev.emergencyContact, contactNumber: e.target.value }
            }))}
            error={errors.emergencyContactNumber}
            required
          />
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
          Add Patient
        </Button>
      </div>
    </form>
  );
};

export default AddPatientForm;