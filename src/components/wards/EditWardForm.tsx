import React, { useState } from 'react';
import { Save, X } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import type { Ward } from '../../types';

interface EditWardFormProps {
  ward: Ward;
  onSave: (ward: Ward) => void;
  onCancel: () => void;
}

const EditWardForm: React.FC<EditWardFormProps> = ({ ward, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: ward.name,
    type: ward.type,
    floorNumber: ward.floorNumber,
    totalBeds: ward.totalBeds,
    availableBeds: ward.availableBeds
  });

  const [errors, setErrors] = useState({
    name: '',
    totalBeds: '',
    availableBeds: ''
  });

  const validateForm = () => {
    const newErrors = {
      name: '',
      totalBeds: '',
      availableBeds: ''
    };
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = 'Ward name is required';
      isValid = false;
    }

    if (formData.totalBeds < 1) {
      newErrors.totalBeds = 'Total beds must be at least 1';
      isValid = false;
    }

    if (formData.availableBeds < 0) {
      newErrors.availableBeds = 'Available beds cannot be negative';
      isValid = false;
    }

    if (formData.availableBeds > formData.totalBeds) {
      newErrors.availableBeds = 'Available beds cannot exceed total beds';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave({
        ...ward,
        ...formData
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Ward Name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          error={errors.name}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ward Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Ward['type'] }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="general">General</option>
            <option value="icu">ICU</option>
            <option value="emergency">Emergency</option>
            <option value="maternity">Maternity</option>
            <option value="pediatric">Pediatric</option>
            <option value="surgical">Surgical</option>
          </select>
        </div>

        <Input
          label="Floor Number"
          type="number"
          value={formData.floorNumber}
          onChange={(e) => setFormData(prev => ({ ...prev, floorNumber: parseInt(e.target.value) }))}
          min="1"
          required
        />

        <Input
          label="Total Beds"
          type="number"
          value={formData.totalBeds}
          onChange={(e) => {
            const totalBeds = parseInt(e.target.value);
            setFormData(prev => ({
              ...prev,
              totalBeds,
              availableBeds: Math.min(prev.availableBeds, totalBeds)
            }));
          }}
          error={errors.totalBeds}
          min="1"
          required
        />

        <Input
          label="Available Beds"
          type="number"
          value={formData.availableBeds}
          onChange={(e) => setFormData(prev => ({ ...prev, availableBeds: parseInt(e.target.value) }))}
          error={errors.availableBeds}
          min="0"
          max={formData.totalBeds}
          required
        />
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Important Note
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Changing the total or available bed count may impact ongoing patient admissions.
                Please coordinate with hospital staff before making changes.
              </p>
            </div>
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
          Save Changes
        </Button>
      </div>
    </form>
  );
};

export default EditWardForm;
