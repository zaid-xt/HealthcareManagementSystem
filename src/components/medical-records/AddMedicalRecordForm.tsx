import React, { useState } from 'react';
import { Save, X } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useAuth } from '../../context/AuthContext';
import { doctors, patients } from '../../utils/mockData';

interface AddMedicalRecordFormProps {
  onSave: (newRecord: any) => void; // accept object without id
  onCancel: () => void;
  preselectedPatientId?: string;
}

const AddMedicalRecordForm: React.FC<AddMedicalRecordFormProps> = ({
  onSave,
  onCancel,
  preselectedPatientId,
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    patientId: preselectedPatientId || '',
    doctorId: user?.role === 'doctor' ? user.id : '',
    diagnosis: '',
    symptoms: '',
    treatment: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newRecord = {
      patientId: formData.patientId,
      doctorId: user?.id,
      date: new Date().toISOString(),
      diagnosis: formData.diagnosis,
      symptoms: formData.symptoms.split(',').map((s) => s.trim()),
      treatment: formData.treatment,
      notes: formData.notes,
      lastUpdated: new Date().toISOString(),
      lastUpdatedBy: user?.id || '',
    };

    onSave(newRecord);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {!preselectedPatientId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient
            </label>
            <select
              value={formData.patientId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, patientId: e.target.value }))
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select a patient</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.firstName} {patient.lastName}
                </option>
              ))}
            </select>
          </div>
        )}

        {user?.role !== 'doctor' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Doctor
            </label>
            <select
              value={formData.doctorId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, doctorId: e.target.value }))
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select a doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization}
                </option>
              ))}
            </select>
          </div>
        )}

        <Input
          label="Diagnosis"
          value={formData.diagnosis}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, diagnosis: e.target.value }))
          }
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Symptoms
          </label>
          <textarea
            value={formData.symptoms}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, symptoms: e.target.value }))
            }
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
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, treatment: e.target.value }))
            }
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
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, notes: e.target.value }))
            }
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
        <Button type="submit" leftIcon={<Save className="h-4 w-4" />}>
          Create Record
        </Button>
      </div>
    </form>
  );
};

export default AddMedicalRecordForm;
