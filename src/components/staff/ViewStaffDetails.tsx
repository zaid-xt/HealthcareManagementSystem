import { X, User, Mail, Phone, Badge, Calendar, Briefcase, Clock } from 'lucide-react';
import { StaffWithShift } from '../../api/staffApi';
import Button from '../ui/Button';

interface ViewStaffDetailsProps {
  staff: StaffWithShift;
  onClose: () => void;
}

export default function ViewStaffDetails({ staff, onClose }: ViewStaffDetailsProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Staff Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">{staff.full_name}</h3>
              <p className="text-lg text-gray-600">{staff.role}</p>
              <span
                className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                  staff.status === 'Active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {staff.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 text-lg border-b pb-2">
                Contact Information
              </h4>
              <div className="flex items-start">
                <Badge className="w-5 h-5 mr-3 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Employee ID</p>
                  <p className="text-gray-900">{staff.employee_id}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Mail className="w-5 h-5 mr-3 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Email</p>
                  <p className="text-gray-900">{staff.email}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Phone className="w-5 h-5 mr-3 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Phone</p>
                  <p className="text-gray-900">{staff.phone || 'Not provided'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 text-lg border-b pb-2">
                Employment Details
              </h4>
              <div className="flex items-start">
                <Briefcase className="w-5 h-5 mr-3 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Department</p>
                  <p className="text-gray-900">{staff.department}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Calendar className="w-5 h-5 mr-3 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Hire Date</p>
                  <p className="text-gray-900">{formatDate(staff.hire_date)}</p>
                </div>
              </div>
            </div>
          </div>

          {staff.current_shift && (
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Clock className="w-5 h-5 mr-2 text-blue-600" />
                <h4 className="font-semibold text-gray-900">Today's Shift</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Shift Time</p>
                  <p className="text-gray-900">
                    {staff.current_shift.start_time.substring(0, 5)} -{' '}
                    {staff.current_shift.end_time.substring(0, 5)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Status</p>
                  <p className="text-gray-900">{staff.current_shift.status}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Department</p>
                  <p className="text-gray-900">{staff.current_shift.department}</p>
                </div>
                {staff.current_shift.notes && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-700">Notes</p>
                    <p className="text-gray-900">{staff.current_shift.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {!staff.current_shift && (
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-gray-600">No shift scheduled for today</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <Button onClick={onClose} variant="secondary">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
