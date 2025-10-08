import { useState, useEffect } from 'react';
import { User, Clock, Phone, Mail, Badge } from 'lucide-react';
import { StaffWithShift } from '../../api/staffApi';

interface StaffCardProps {
  staff: StaffWithShift;
  onView: (staff: StaffWithShift) => void;
}

export default function StaffCard({ staff, onView }: StaffCardProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [isOnDuty, setIsOnDuty] = useState<boolean>(false);

  useEffect(() => {
    const calculateDutyStatus = () => {
      if (!staff.current_shift) {
        setIsOnDuty(false);
        setTimeRemaining('');
        return;
      }

      const now = new Date();
      const currentTime = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

      const [startHours, startMinutes] = staff.current_shift.start_time.split(':').map(Number);
      const [endHours, endMinutes] = staff.current_shift.end_time.split(':').map(Number);

      const startSeconds = startHours * 3600 + startMinutes * 60;
      let endSeconds = endHours * 3600 + endMinutes * 60;

      if (endSeconds < startSeconds) {
        endSeconds += 24 * 3600;
      }

      let adjustedCurrentTime = currentTime;
      if (currentTime < startSeconds && endSeconds > 24 * 3600) {
        adjustedCurrentTime += 24 * 3600;
      }

      if (adjustedCurrentTime >= startSeconds && adjustedCurrentTime < endSeconds) {
        setIsOnDuty(true);
        const secondsLeft = endSeconds - adjustedCurrentTime;
        const hours = Math.floor(secondsLeft / 3600);
        const minutes = Math.floor((secondsLeft % 3600) / 60);
        setTimeRemaining(`${hours}h ${minutes}m left`);
      } else {
        setIsOnDuty(false);
        setTimeRemaining('');
      }
    };

    calculateDutyStatus();
    const interval = setInterval(calculateDutyStatus, 60000);

    return () => clearInterval(interval);
  }, [staff.current_shift]);

  return (
    <div
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4"
      style={{ borderLeftColor: isOnDuty ? '#10b981' : '#d1d5db' }}
      onClick={() => onView(staff)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-semibold text-gray-900">{staff.full_name}</h3>
            <p className="text-sm text-gray-600">{staff.role}</p>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            isOnDuty
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {isOnDuty ? 'On Duty' : 'Off Duty'}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-700">
          <Badge className="w-4 h-4 mr-2 text-gray-500" />
          <span className="font-medium mr-2">ID:</span>
          <span>{staff.employee_id}</span>
        </div>
        <div className="flex items-center text-sm text-gray-700">
          <span className="font-medium mr-2">Department:</span>
          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
            {staff.department}
          </span>
        </div>
        <div className="flex items-center text-sm text-gray-700">
          <Mail className="w-4 h-4 mr-2 text-gray-500" />
          <span>{staff.email}</span>
        </div>
        <div className="flex items-center text-sm text-gray-700">
          <Phone className="w-4 h-4 mr-2 text-gray-500" />
          <span>{staff.phone || 'N/A'}</span>
        </div>
      </div>

      {isOnDuty && staff.current_shift && (
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-700">
              <Clock className="w-4 h-4 mr-2 text-green-600" />
              <span>
                {staff.current_shift.start_time.substring(0, 5)} - {staff.current_shift.end_time.substring(0, 5)}
              </span>
            </div>
            <span className="text-sm font-semibold text-green-600">
              {timeRemaining}
            </span>
          </div>
        </div>
      )}

      {!isOnDuty && staff.current_shift && (
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            <span>
              Shift: {staff.current_shift.start_time.substring(0, 5)} - {staff.current_shift.end_time.substring(0, 5)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
