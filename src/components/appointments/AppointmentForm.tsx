import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, FileText, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { doctors } from '../../utils/mockData';
import type { Appointment } from '../../types';

interface AppointmentFormProps {
  onSubmit: (appointment: Partial<Appointment>) => void;
  isLoading?: boolean;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ onSubmit, isLoading }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    doctorId: '',
    date: '',
    time: '',
    type: 'regular',
    notes: ''
  });
  
  const [formErrors, setFormErrors] = useState({
    doctorId: '',
    date: '',
    time: '',
    type: '',
  });

  const validateForm = () => {
    const errors = {
      doctorId: '',
      date: '',
      time: '',
      type: '',
    };
    let isValid = true;

    if (!formData.doctorId) {
      errors.doctorId = 'Please select a doctor';
      isValid = false;
    }

    if (!formData.date) {
      errors.date = 'Please select a date';
      isValid = false;
    }

    if (!formData.time) {
      errors.time = 'Please select a time';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Convert time to start and end time (30-minute appointments)
    const [hours, minutes] = formData.time.split(':');
    const startTime = `${formData.time}`;
    const endTime = `${String(Number(hours) + (Number(minutes) + 30 >= 60 ? 1 : 0)).padStart(2, '0')}:${String((Number(minutes) + 30) % 60).padStart(2, '0')}`;
    
    onSubmit({
      doctorId: formData.doctorId,
      patientId: user?.id || '',
      date: formData.date,
      startTime,
      endTime,
      type: formData.type as Appointment['type'],
      notes: formData.notes,
      status: 'scheduled'
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Select Doctor</label>
          <select
            value={formData.doctorId}
            onChange={(e) => setFormData(prev => ({ ...prev, doctorId: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select a doctor</option>
            {doctors.map(doctor => (
              <option key={doctor.id} value={doctor.id}>
                Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization}
              </option>
            ))}
          </select>
          {formErrors.doctorId && (
            <p className="mt-1 text-sm text-red-600">{formErrors.doctorId}</p>
          )}
        </div>

        <Input
          label="Date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
          error={formErrors.date}
          leftIcon={<Calendar className="h-4 w-4" />}
          min={new Date().toISOString().split('T')[0]}
        />

        <Input
          label="Time"
          type="time"
          value={formData.time}
          onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
          error={formErrors.time}
          leftIcon={<Clock className="h-4 w-4" />}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700">Appointment Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="regular">Regular Checkup</option>
            <option value="follow-up">Follow-up</option>
            <option value="emergency">Emergency</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Any additional information for the doctor..."
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(-1)}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={isLoading}
        >
          Schedule Appointment
        </Button>
      </div>
    </form>
  );
};

export default AppointmentForm;