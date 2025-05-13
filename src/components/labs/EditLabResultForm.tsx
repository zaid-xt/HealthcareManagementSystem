import React, { useState } from 'react';
import { Save, X } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import type { Lab } from '../../types';

interface EditLabResultFormProps {
  lab: Lab;
  onSave: (updatedLab: Lab) => void;
  onCancel: () => void;
}

const EditLabResultForm: React.FC<EditLabResultFormProps> = ({
  lab,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    testType: lab.testType,
    date: lab.date,
    results: lab.results || '',
    status: lab.status
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedLab: Lab = {
      ...lab,
      ...formData
    };
    
    onSave(updatedLab);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <Input
          label="Test Type"
          value={formData.testType}
          onChange={(e) => setFormData(prev => ({ ...prev, testType: e.target.value }))}
          required
        />

        <Input
          label="Date"
          type="date"
          value={formData.date.split('T')[0]}
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
          Update Lab Result
        </Button>
      </div>
    </form>
  );
};

export default EditLabResultForm;