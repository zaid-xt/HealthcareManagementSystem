import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import type { Lab } from '../../types';
import { updateLabResult, fetchLabResult } from '../../api/labResultsApi';

interface EditLabResultFormProps {
  labId: string;
  onSave: (updatedLab: Lab) => void;
  onCancel: () => void;
}

const EditLabResultForm: React.FC<EditLabResultFormProps> = ({
  labId,
  onSave,
  onCancel
}) => {
  const [lab, setLab] = useState<Lab | null>(null);
  const [formData, setFormData] = useState({
    testType: '',
    date: '',
    results: '',
    status: 'pending' as Lab['status']
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [loadingLab, setLoadingLab] = useState(true);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  // Load lab result data on component mount
  useEffect(() => {
    const loadLabResult = async () => {
      try {
        setLoadingLab(true);
        const labData = await fetchLabResult(labId);
        setLab(labData);
        setFormData({
          testType: labData.testType,
          date: labData.date.split('T')[0], // Format date for input
          results: labData.results || '',
          status: labData.status
        });
      } catch (error) {
        console.error('Failed to load lab result:', error);
        setErrors({ general: 'Failed to load lab result. Please try again.' });
      } finally {
        setLoadingLab(false);
      }
    };

    loadLabResult();
  }, [labId]);

  const validateField = (field: string, value: string) => {
    switch (field) {
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
    
    newErrors.testType = validateField('testType', formData.testType);
    newErrors.date = validateField('date', formData.date);
    
    // Remove empty error messages
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key]) delete newErrors[key];
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Real-time validation for touched fields
    if (touched[field]) {
      const fieldError = validateField(field, value);
      setErrors(prev => ({
        ...prev,
        [field]: fieldError
      }));
    }
  };

  const handleFieldBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const fieldError = validateField(field, formData[field as keyof typeof formData] as string);
    setErrors(prev => ({
      ...prev,
      [field]: fieldError
    }));
  };

  // Auto-save functionality
  const autoSave = async () => {
    if (!lab || Object.keys(errors).length > 0) return;
    
    try {
      setAutoSaving(true);
      await updateLabResult(labId, formData);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setAutoSaving(false);
    }
  };

  // Debounced auto-save effect
  useEffect(() => {
    if (!lab || loadingLab) return;
    
    // Clear existing timeout
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }
    
    // Set new timeout for auto-save (3 seconds after last change)
    const timeout = setTimeout(() => {
      autoSave();
    }, 3000);
    
    setAutoSaveTimeout(timeout);
    
    // Cleanup timeout on unmount
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [formData, lab, loadingLab]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !lab) {
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    try {
      const updatedLab = await updateLabResult(labId, formData);
      onSave(updatedLab);
    } catch (error) {
      console.error('Failed to update lab result:', error);
      setErrors({ general: error instanceof Error ? error.message : 'Failed to update lab result. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (loadingLab) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lab result...</p>
        </div>
      </div>
    );
  }

  if (!lab) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-sm text-red-600">Failed to load lab result data.</p>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="mt-2"
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{errors.general}</p>
        </div>
      )}
      
      {/* Auto-save status */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-2">
          {autoSaving && (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
              <span>Auto-saving...</span>
            </>
          )}
          {lastSaved && !autoSaving && (
            <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
          )}
        </div>
      </div>
      
      <div className="space-y-4">
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Results
          </label>
          <textarea
            value={formData.results}
            onChange={(e) => setFormData(prev => ({ ...prev, results: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={4}
            placeholder="Enter test results..."
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Lab['status'] }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            disabled={loading}
          >
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          leftIcon={<X className="h-4 w-4" />}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          leftIcon={<Save className="h-4 w-4" />}
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Update Lab Result'}
        </Button>
      </div>
    </form>
  );
};

export default EditLabResultForm;