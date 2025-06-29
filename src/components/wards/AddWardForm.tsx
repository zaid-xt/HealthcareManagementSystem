import React, { useState } from 'react';
import { Save, X } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useAuth } from '../../context/AuthContext';
import type { Ward } from '../../types';

interface AddWardFormProps {
  onSave: (ward: Omit<Ward, 'id'>) => void;
  onCancel: () => void;
}

const AddWardForm: React.FC<AddWardFormProps> = ({ onSave, onCancel }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    type: 'general' as Ward['type'],
    floorNumber: 1,
    totalBeds: 10,
    availableBeds: 10
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

    if (!formData.name) {
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
        ...formData,
        managedBy: user?.id || ''
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
          placeholder="e.g., General Ward A"
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ward Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Ward['type'] }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
          Add Ward
        </Button>
      </div>
    </form>
  );
};

export default AddWardForm;