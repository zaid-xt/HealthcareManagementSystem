import React from 'react';
import { X, User, Phone, Mail, MapPin, Heart, AlertTriangle } from 'lucide-react';
import Button from '../ui/Button';
import type { Patient } from '../../types';

interface ViewPatientProps {
  patient: Patient;
  onClose: () => void;
}

const ViewPatient: React.FC<ViewPatientProps> = ({ patient, onClose }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center">
          <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <span className="text-xl font-medium">
              {patient.firstName[0]}{patient.lastName[0]}
            </span>
          </div>
          <div className="ml-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              {patient.firstName} {patient.lastName}
            </h2>
            <p className="text-gray-500">Patient ID: {patient.patientId}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
          leftIcon={<X className="h-4 w-4" />}
        >
          Close
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 flex items-center mb-3">
              <User className="h-5 w-5 text-blue-600 mr-2" />
              Personal Information
            </h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-500">Date of Birth:</span> {new Date(patient.dateOfBirth).toLocaleDateString()}</p>
              <p><span className="text-gray-500">Gender:</span> {patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)}</p>
              <p><span className="text-gray-500">Blood Type:</span> {patient.bloodType || 'Not specified'}</p>
              <p><span className="text-gray-500">Status:</span> 
                <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${patient.status === 'active' ? 'bg-green-100 text-green-800' :
                    patient.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                    patient.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'}`}>
                  {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                </span>
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 flex items-center mb-3">
              <Phone className="h-5 w-5 text-blue-600 mr-2" />
              Contact Information
            </h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-500">Phone:</span> {patient.contactNumber}</p>
              <p><span className="text-gray-500">Email:</span> {patient.email}</p>
              <p><span className="text-gray-500">Address:</span> {patient.address}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 flex items-center mb-3">
              <AlertTriangle className="h-5 w-5 text-blue-600 mr-2" />
              Emergency Contact
            </h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-500">Name:</span> {patient.emergencyContact.name}</p>
              <p><span className="text-gray-500">Relationship:</span> {patient.emergencyContact.relation}</p>
              <p><span className="text-gray-500">Phone:</span> {patient.emergencyContact.contactNumber}</p>
            </div>
          </div>

          {patient.insuranceDetails && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 flex items-center mb-3">
                <Heart className="h-5 w-5 text-blue-600 mr-2" />
                Insurance Information
              </h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-500">Provider:</span> {patient.insuranceDetails.provider}</p>
                <p><span className="text-gray-500">Policy Number:</span> {patient.insuranceDetails.policyNumber}</p>
                <p><span className="text-gray-500">Expiry Date:</span> {new Date(patient.insuranceDetails.expiryDate).toLocaleDateString()}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewPatient;