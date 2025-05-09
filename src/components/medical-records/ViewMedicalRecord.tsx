import React from 'react';
import { X, Calendar, User, Stethoscope, FileText } from 'lucide-react';
import Button from '../ui/Button';
import { doctors, patients } from '../../utils/mockData';
import type { MedicalRecord } from '../../types';

interface ViewMedicalRecordProps {
  record: MedicalRecord;
  onClose: () => void;
}

const ViewMedicalRecord: React.FC<ViewMedicalRecordProps> = ({
  record,
  onClose
}) => {
  const patient = patients.find(p => p.id === record.patientId);
  const doctor = doctors.find(d => d.id === record.doctorId);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <h2 className="text-xl font-semibold text-gray-900">Medical Record Details</h2>
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
            <div className="flex items-center mb-2">
              <User className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="font-medium text-gray-900">Patient Information</h3>
            </div>
            <div className="text-sm text-gray-600">
              <p>Name: {patient?.firstName} {patient?.lastName}</p>
              <p>ID: {patient?.id}</p>
              <p>Contact: {patient?.contactNumber}</p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <Stethoscope className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="font-medium text-gray-900">Doctor Information</h3>
            </div>
            <div className="text-sm text-gray-600">
              <p>Name: Dr. {doctor?.firstName} {doctor?.lastName}</p>
              <p>Specialization: {doctor?.specialization}</p>
              <p>Contact: {doctor?.contactNumber}</p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <Calendar className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="font-medium text-gray-900">Record Timeline</h3>
            </div>
            <div className="text-sm text-gray-600">
              <p>Created: {new Date(record.date).toLocaleString()}</p>
              <p>Last Updated: {new Date(record.lastUpdated).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <FileText className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="font-medium text-gray-900">Medical Details</h3>
            </div>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Diagnosis</h4>
                <p className="text-sm text-gray-600">{record.diagnosis}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700">Symptoms</h4>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {record.symptoms.map((symptom, index) => (
                    <li key={index}>{symptom}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700">Treatment</h4>
                <p className="text-sm text-gray-600">{record.treatment}</p>
              </div>
              
              {record.notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Additional Notes</h4>
                  <p className="text-sm text-gray-600">{record.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewMedicalRecord;