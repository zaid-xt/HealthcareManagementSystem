import React, { useEffect, useState } from 'react';
import { X, Calendar, User, Stethoscope, FileText } from 'lucide-react';
import Button from '../ui/Button';
import type { MedicalRecord } from '../../types';

interface ViewMedicalRecordProps {
  record: MedicalRecord;
  onClose: () => void;
}

const ViewMedicalRecord: React.FC<ViewMedicalRecordProps> = ({ record, onClose }) => {
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);

  useEffect(() => {
    loadPatients();
    loadDoctors();
  }, []);

  const loadPatients = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/patients');
      const data = await res.json();
      // ensure all IDs are strings for consistent comparison
      setPatients(data.map((p: any) => ({ ...p, id: String(p.id) })));
    } catch (err) {
      console.error('Failed to load patients', err);
    }
  };

  const loadDoctors = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/doctors');
      const data = await res.json();
      setDoctors(data.map((d: any) => ({ ...d, id: String(d.id) })));
    } catch (err) {
      console.error('Failed to load doctors', err);
    }
  };

  // ✅ Patient lookup by numeric ID
  const patient = patients.find((p) => String(p.id) === String(record.patientId));

  // ✅ Doctor lookup by doctorId field or numeric id
  const doctor = doctors.find(
    (d) => d.doctorId === record.doctorId || String(d.id) === String(record.doctorId)
  );

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
        {/* Patient Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <User className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="font-medium text-gray-900">Patient Information</h3>
          </div>
          <div className="text-sm text-gray-600">
            <p>Name: {patient?.name || 'Unknown'}</p>
            <p>Patient ID: {patient?.id || 'N/A'}</p>
            <p>Contact Number: {patient?.contactNumber || 'N/A'}</p>
            <p>Email: {patient?.email || 'N/A'}</p>
          </div>
        </div>

        {/* Doctor Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <Stethoscope className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="font-medium text-gray-900">Doctor Information</h3>
          </div>
          <div className="text-sm text-gray-600">
            <p>Name: {doctor?.name || 'Unknown'}</p>
            {/* <p>Doctor ID: {doctor?.doctorId || doctor?.id || 'N/A'}</p> */}
            <p>Contact Number: {doctor?.contactNumber || 'N/A'}</p>
            <p>Email: {doctor?.email || 'N/A'}</p>
          </div>
        </div>

        {/* Record Timeline */}
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

        {/* Medical Details */}
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
  );
};

export default ViewMedicalRecord;
