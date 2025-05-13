import React, { useState } from 'react';
import { Save, X } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useAuth } from '../../context/AuthContext';
import type { Lab } from '../../types';
import { patients } from '../../utils/mockData';

interface AddLabResultFormProps {
  onSave: (lab: Partial<Lab>) => void;
  onCancel: () => void;
}

const AddLabResultForm: React.FC<AddLabResultFormProps> = ({ onSave, onCancel }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    patientId: '',
    testType: '',
    date: new Date().toISOString().split('T')[0],
    results: '',
    status: 'pending' as Lab['status']
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newLab: Partial<Lab> = {
      ...formData,
      doctorId: user?.id || '',
      requestedBy: user?.id || '',
    };
    
    onSave(newLab);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Patient
          </label>
          <select
            value={formData.patientId}
            onChange={(e) => setFormData(prev => ({ ...prev, patientId: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="">Select a patient</option>
            {patients.map(patient => (
              <option key={patient.id} value={patient.id}>
                {patient.firstName} {patient.lastName}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Test Type"
          value={formData.testType}
          onChange={(e) => setFormData(prev => ({ ...prev, testType: e.target.value }))}
          required
        />

        <Input
          label="Date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
          required
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
        >
          Cancel
        </Button>
        <Button
          type="submit"
          leftIcon={<Save className="h-4 w-4" />}
        >
          Save Lab Result
        </Button>
      </div>
    </form>
  );
};

export default AddLabResultForm;