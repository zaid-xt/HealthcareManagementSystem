import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useAuth } from '../../context/AuthContext';
import type { Lab } from '../../types';
import { getUsersByRole, type User } from '../../api/usersApi';

interface AddLabResultFormProps {
  onSave: (lab: Partial<Lab>) => void;
  onCancel: () => void;
  loading?: boolean;
}

const AddLabResultForm: React.FC<AddLabResultFormProps> = ({ onSave, onCancel, loading }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    patientId: '',
    testType: '',
    date: new Date().toISOString().split('T')[0],
    results: '',
    status: 'pending' as Lab['status'],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [patients, setPatients] = useState<User[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadPatients = async () => {
      try {
        setLoadingPatients(true);
        const patientsData = await getUsersByRole('patient');
        setPatients(patientsData);
      } catch (error) {
        console.error('Failed to load patients:', error);
        setErrors(prev => ({ ...prev, general: 'Failed to load patients. Please try again.' }));
      } finally {
        setLoadingPatients(false);
      }
    };
    loadPatients();
  }, []);

  const validateField = (field: string, value: string) => {
    switch (field) {
      case 'patientId':
        return !value ? 'Patient is required' : '';
      case 'testType':
        if (!value.trim()) return 'Test type is required';
        if (value.trim().length < 2) return 'Test type must be at least 2 characters';
        return '';
      case 'date':
        if (!value) return 'Date is required';
        const selectedDate = new Date(value);
        const today = new Date();
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(today.getFullYear() - 1);
        if (selectedDate > today) return 'Date cannot be in the future';
        if (selectedDate < oneYearAgo) return 'Date cannot be more than a year ago';
        return '';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    newErrors.patientId = validateField('patientId', formData.patientId);
    newErrors.testType = validateField('testType', formData.testType);
    newErrors.date = validateField('date', formData.date);

    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key]) delete newErrors[key];
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const fieldError = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: fieldError }));
    }
  };

  const handleFieldBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const fieldError = validateField(field, formData[field as keyof typeof formData] as string);
    setErrors(prev => ({ ...prev, [field]: fieldError }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!validateForm()) return;

    // Only pass data to parent; parent handles API call
    onSave({ ...formData, doctorId: user?.id || '', requestedBy: user?.id || '' });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{errors.general}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Patient select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
          <select
            value={formData.patientId}
            onChange={(e) => handleFieldChange('patientId', e.target.value)}
            onBlur={() => handleFieldBlur('patientId')}
            className={`mt-1 block w-full rounded-md border shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 ${
              errors.patientId ? 'border-red-300' : 'border-gray-300'
            }`}
            required
            disabled={loading || loadingPatients}
          >
            <option value="">{loadingPatients ? 'Loading patients...' : 'Select a patient'}</option>
            {patients.map(patient => (
              <option key={patient.id} value={patient.id}>{patient.name}</option>
            ))}
          </select>
          {errors.patientId && <p className="mt-1 text-sm text-red-600">{errors.patientId}</p>}
        </div>

        {/* Test Type */}
        <Input
          label="Test Type"
          value={formData.testType}
          onChange={(e) => handleFieldChange('testType', e.target.value)}
          onBlur={() => handleFieldBlur('testType')}
          required
          disabled={loading}
          error={errors.testType}
          placeholder="e.g., Blood Test, X-Ray, MRI"
          helperText={!errors.testType ? "Enter the type of laboratory test being ordered" : undefined}
        />

        {/* Date */}
        <Input
          label="Date"
          type="date"
          value={formData.date}
          onChange={(e) => handleFieldChange('date', e.target.value)}
          onBlur={() => handleFieldBlur('date')}
          required
          disabled={loading}
          error={errors.date}
          helperText={!errors.date ? "Date when the test was conducted or ordered" : undefined}
          max={new Date().toISOString().split('T')[0]}
        />

        {/* Results */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Results</label>
          <textarea
            value={formData.results}
            onChange={(e) => setFormData(prev => ({ ...prev, results: e.target.value }))}
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
            rows={4}
            placeholder="Enter test results..."
            disabled={loading}
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Lab['status'] }))}
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
            required
            disabled={loading}
          >
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel} leftIcon={<X className="h-4 w-4" />} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" leftIcon={<Save className="h-4 w-4" />} disabled={loading}>
          {loading ? 'Saving...' : 'Save Lab Result'}
        </Button>
      </div>
    </form>
  );
};

export default AddLabResultForm;
