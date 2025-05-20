import React from 'react';
import { X, Clock } from 'lucide-react';
import Button from '../ui/Button';
import type { Doctor } from '../../types';

interface ViewScheduleModalProps {
  doctor: Doctor;
  onClose: () => void;
}

const ViewScheduleModal: React.FC<ViewScheduleModalProps> = ({ doctor, onClose }) => {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const sortedAvailability = [...doctor.availability].sort((a, b) => 
    daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            Dr. {doctor.firstName} {doctor.lastName}'s Schedule
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            leftIcon={<X className="h-4 w-4" />}
          >
            Close
          </Button>
        </div>

        <div className="space-y-4">
          {sortedAvailability.map((schedule, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center">
                <div className="w-24 font-medium text-gray-900">{schedule.day}</div>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  {schedule.startTime} - {schedule.endTime}
                </div>
              </div>
            </div>
          ))}

          {sortedAvailability.length === 0 && (
            <p className="text-center text-gray-500 py-4">
              No availability schedule set
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewScheduleModal;