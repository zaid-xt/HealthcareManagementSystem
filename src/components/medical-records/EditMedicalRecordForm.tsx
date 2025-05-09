import React, { useState } from 'react';
import { Save, X } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import type { MedicalRecord } from '../../types';

interface EditMedicalRecordFormProps {
  record: MedicalRecord;
  onSave: (updatedRecord: MedicalRecord) => void;
  onCancel: () => void;
}

const EditMedicalRecordForm: React.FC<EditMedicalRecordFormProps> = ({
  record,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    diagnosis: record.diagnosis,
    symptoms: record.symptoms.join(', '),
    treatment: record.treatment,
    notes: record.notes
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedRecord: MedicalRecord = {
      ...record,
      diagnosis: formData.diagnosis,
      symptoms: formData.symptoms.split(',').map(s => s.trim()),
      treatment: formData.treatment,
      notes: formData.notes,
      lastUpdated: new Date().toISOString()
    };
    
    onSave(updatedRecord);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <Input
          label="Diagnosis"
          value={formData.diagnosis}
          onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
          required
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Symptoms
          </label>
          <textarea
            value={formData.symptoms}
            onChange={(e) => setFormData(prev => ({ ...prev, symptoms: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={3}
            placeholder="Enter symptoms separated by commas"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Treatment
          </label>
          <textarea
            value={formData.treatment}
            onChange={(e) => setFormData(prev => ({ ...prev, treatment: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={3}
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={4}
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
          Save Changes
        </Button>
      </div>
    </form>
  );
};

export default EditMedicalRecordForm;