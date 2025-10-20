import React, { useState, useEffect } from 'react';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { prescriptionAPI, type Medicine } from '../../api/prescriptionApi';
import type { Prescription } from '../../types';

interface EditPrescriptionFormProps {
  prescription: Prescription;
  onSave: (prescription: Prescription) => void;
  onCancel: () => void;
}

interface MedicationItem {
  id?: string;
  medicineId: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  instructions: string;
}

const EditPrescriptionForm: React.FC<EditPrescriptionFormProps> = ({
  prescription,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    date: prescription.date,
    status: prescription.status,
    notes: prescription.notes || ''
  });

  const [medications, setMedications] = useState<MedicationItem[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    medications: ''
  });

  // Load medicines and existing prescription medications
  useEffect(() => {
    const loadData = async () => {
      try {
        const medicinesData = await prescriptionAPI.getMedicines();
        setMedicines(medicinesData);
        
        // Use the medications from the prescription prop (already loaded from API)
        if (prescription.medications && prescription.medications.length > 0) {
          setMedications(prescription.medications.map(med => ({
            id: med.id,
            medicineId: med.medicineId,
            dosage: med.dosage,
            frequency: med.frequency,
            duration: med.duration,
            quantity: med.quantity,
            instructions: med.instructions || ''
          })));
        } else {
          setMedications([{
            medicineId: '',
            dosage: '',
            frequency: '',
            duration: '',
            quantity: 1,
            instructions: ''
          }]);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };

    loadData();
  }, [prescription]);

  const validateForm = () => {
    const newErrors = {
      medications: ''
    };
    let isValid = true;

    const validMedications = medications.filter(med => 
      med.medicineId && med.dosage && med.frequency && med.duration && med.quantity > 0
    );

    if (validMedications.length === 0) {
      newErrors.medications = 'Please add at least one complete medication';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Prepare updated prescription data
      const updatedPrescription: Prescription = {
        ...prescription,
        ...formData
      };

      // Prepare medications for API
      const validMedications = medications
        .filter(med => med.medicineId && med.dosage && med.frequency && med.duration && med.quantity > 0)
        .map(med => ({
          id: med.id, // Keep existing IDs for updates
          medicineId: med.medicineId,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration,
          quantity: med.quantity,
          instructions: med.instructions
        }));

      // Call the onSave callback with the updated data
      onSave({
        ...updatedPrescription,
        medications: validMedications
      });
    } catch (error) {
      console.error('Error preparing prescription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addMedication = () => {
    setMedications(prev => [...prev, {
      medicineId: '',
      dosage: '',
      frequency: '',
      duration: '',
      quantity: 1,
      instructions: ''
    }]);
  };

  const removeMedication = (index: number) => {
    if (medications.length > 1) {
      setMedications(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateMedication = (index: number, field: keyof MedicationItem, value: string | number) => {
    setMedications(prev => prev.map((med, i) => 
      i === index ? { ...med, [field]: value } : med
    ));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
          required
          disabled={loading}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Prescription['status'] }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            disabled={loading}
          >
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Additional notes or instructions..."
          disabled={loading}
        />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Medications</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addMedication}
            leftIcon={<Plus className="h-4 w-4" />}
            disabled={loading}
          >
            Add Medication
          </Button>
        </div>

        {errors.medications && (
          <p className="text-sm text-red-600">{errors.medications}</p>
        )}

        {medications.map((medication, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-lg space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-gray-900">Medication {index + 1}</h4>
              {medications.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeMedication(index)}
                  className="text-red-600 hover:bg-red-50"
                  leftIcon={<Trash2 className="h-4 w-4" />}
                  disabled={loading}
                >
                  Remove
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medicine *
                </label>
                <select
                  value={medication.medicineId}
                  onChange={(e) => updateMedication(index, 'medicineId', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  disabled={loading}
                >
                  <option value="">Select medicine</option>
                  {medicines.map(medicine => (
                    <option key={medicine.id} value={medicine.id}>
                      {medicine.name} {medicine.strength && `(${medicine.strength})`} - {medicine.dosageForm}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Dosage *"
                value={medication.dosage}
                onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                placeholder="e.g., 10mg, 1 tablet"
                required
                disabled={loading}
              />

              <Input
                label="Frequency *"
                value={medication.frequency}
                onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                placeholder="e.g., Twice daily, Every 8 hours"
                required
                disabled={loading}
              />

              <Input
                label="Duration *"
                value={medication.duration}
                onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                placeholder="e.g., 7 days, 2 weeks"
                required
                disabled={loading}
              />

              <Input
                label="Quantity *"
                type="number"
                value={medication.quantity}
                onChange={(e) => updateMedication(index, 'quantity', parseInt(e.target.value) || 1)}
                min="1"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instructions
              </label>
              <textarea
                value={medication.instructions}
                onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Special instructions for taking this medication..."
                disabled={loading}
              />
            </div>
          </div>
        ))}
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
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
};

export default EditPrescriptionForm;