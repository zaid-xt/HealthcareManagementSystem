import React, { useState } from 'react';
import { X, User, Phone, Mail, MapPin, Heart, AlertTriangle, FileText, Plus, Calendar, Stethoscope } from 'lucide-react';
import Button from '../ui/Button';
import { medicalRecords, doctors } from '../../utils/mockData';
import { useAuth } from '../../context/AuthContext';
import type { Patient, MedicalRecord } from '../../types';

interface ViewPatientProps {
  patient: Patient;
  onClose: () => void;
  onAddMedicalRecord?: () => void;
}

const ViewPatient: React.FC<ViewPatientProps> = ({ patient, onClose, onAddMedicalRecord }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'info' | 'records'>('info');
  
  // Get medical records for this patient
  const patientRecords = medicalRecords.filter(record => record.patientId === patient.id);
  
  const canManageRecords = user?.role === 'admin' || user?.role === 'doctor';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="flex justify-between items-start p-6 border-b">
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

      {/* Tab Navigation */}
      <div className="border-b">
        <nav className="flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'info'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              Patient Information
            </div>
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'records'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Medical Records ({patientRecords.length})
            </div>
          </button>
        </nav>
      </div>

      <div className="p-6">
        {activeTab === 'info' && (
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
        )}

        {activeTab === 'records' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Medical Records</h3>
              {canManageRecords && onAddMedicalRecord && (
                <Button
                  onClick={onAddMedicalRecord}
                  size="sm"
                  leftIcon={<Plus className="h-4 w-4" />}
                >
                  Add Record
                </Button>
              )}
            </div>

            {patientRecords.length > 0 ? (
              <div className="space-y-4">
                {patientRecords
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((record) => {
                    const doctor = doctors.find(d => d.id === record.doctorId);
                    
                    return (
                      <div key={record.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">{record.diagnosis}</h4>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(record.date).toLocaleDateString()}
                              <Stethoscope className="h-4 w-4 ml-4 mr-1" />
                              Dr. {doctor?.firstName} {doctor?.lastName}
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm font-medium text-gray-700">Symptoms:</span>
                            <p className="text-sm text-gray-600 mt-1">
                              {record.symptoms.join(', ')}
                            </p>
                          </div>
                          
                          <div>
                            <span className="text-sm font-medium text-gray-700">Treatment:</span>
                            <p className="text-sm text-gray-600 mt-1">
                              {record.treatment}
                            </p>
                          </div>
                          
                          {record.notes && (
                            <div>
                              <span className="text-sm font-medium text-gray-700">Notes:</span>
                              <p className="text-sm text-gray-600 mt-1">
                                {record.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No medical records</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No medical records have been created for this patient yet.
                </p>
                {canManageRecords && onAddMedicalRecord && (
                  <div className="mt-6">
                    <Button
                      onClick={onAddMedicalRecord}
                      leftIcon={<Plus className="h-4 w-4" />}
                    >
                      Add First Record
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewPatient;