import React, { useState } from 'react';
import { X, Calendar, Clock } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import type { Appointment } from '../../types';

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (date: string, time: string) => void;
  appointment: Appointment | null;
  isLoading?: boolean;
}

const RescheduleModal: React.FC<RescheduleModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  appointment,
  isLoading,
}) => {
  const [date, setDate] = useState(appointment?.date || '');
  const [time, setTime] = useState(appointment?.startTime || '');
  const [errors, setErrors] = useState({ date: '', time: '' });

  const validateForm = () => {
    const newErrors = { date: '', time: '' };
    let isValid = true;

    if (!date) {
      newErrors.date = 'Please select a date';
      isValid = false;
    }

    if (!time) {
      newErrors.time = 'Please select a time';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(date, time);
    }
  };

  if (!isOpen || !appointment) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Reschedule Appointment</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="New Date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                error={errors.date}
                leftIcon={<Calendar className="h-4 w-4" />}
                min={new Date().toISOString().split('T')[0]}
              />

              <Input
                label="New Time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                error={errors.time}
                leftIcon={<Clock className="h-4 w-4" />}
              />

              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={isLoading}>
                  Reschedule
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RescheduleModal;
