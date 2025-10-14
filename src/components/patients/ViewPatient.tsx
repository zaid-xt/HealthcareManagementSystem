import React from 'react';
import { X, User, Phone, Mail, MapPin } from 'lucide-react';
import Button from '../ui/Button';
import type { PatientUser } from '../../types';

interface ViewPatientProps {
  patient: PatientUser;
  onClose: () => void;
}

const ViewPatient: React.FC<ViewPatientProps> = ({ patient, onClose }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <h2 className="text-xl font-semibold text-gray-900">Patient Details</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
          leftIcon={<X className="h-4 w-4" />}
        >
          Close
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Personal Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center mb-4">
            <User className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="font-medium text-gray-900">Personal Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <p className="text-sm text-gray-900 mt-1">{patient.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">ID Number</label>
              <p className="text-sm text-gray-900 mt-1 font-mono">{patient.idNumber}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Role</label>
              <p className="text-sm text-gray-900 mt-1 capitalize">{patient.role}</p>
            </div>
            {patient.gender && (
              <div>
                <label className="text-sm font-medium text-gray-700">Gender</label>
                <p className="text-sm text-gray-900 mt-1 capitalize">{patient.gender}</p>
              </div>
            )}
            {patient.bloodType && (
              <div>
                <label className="text-sm font-medium text-gray-700">Blood Type</label>
                <p className="text-sm text-gray-900 mt-1">{patient.bloodType}</p>
              </div>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center mb-4">
            <Phone className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="font-medium text-gray-900">Contact Information</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center">
              <Phone className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-900">{patient.contactNumber}</span>
            </div>
            <div className="flex items-center">
              <Mail className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-900">{patient.email}</span>
            </div>
            {patient.address && (
              <div className="flex items-start">
                <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                <span className="text-sm text-gray-900">{patient.address}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPatient;