import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Stethoscope, Pill, Edit2, FileText } from 'lucide-react';
import Button from '../ui/Button';
import { fetchPrescriptionById } from '../../api/prescriptionsApi';
import { useAuth } from '../../context/AuthContext';
import type { Prescription } from '../../types';

interface ViewPrescriptionProps {
  prescription: Prescription;
  onClose: () => void;
  onEdit: () => void;
}

const ViewPrescription: React.FC<ViewPrescriptionProps> = ({
  prescription,
  onClose,
  onEdit
}) => {
  const { user } = useAuth();
  const [prescriptionDetails, setPrescriptionDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPrescriptionDetails();
  }, [prescription.id]);

  const loadPrescriptionDetails = async () => {
    try {
      const details = await fetchPrescriptionById(prescription.id);
      setPrescriptionDetails(details);
    } catch (error) {
      console.error('Failed to load prescription details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const canEdit = (user?.role === 'doctor' && String(prescription.doctorId) === String(user.id)) || user?.role === 'admin';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!prescriptionDetails) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load prescription details</p>
        <Button onClick={onClose} className="mt-4">Close</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <h2 className="text-xl font-semibold text-gray-900">Prescription Details</h2>
        <div className="flex space-x-2">
          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              leftIcon={<Edit2 className="h-4 w-4" />}
            >
              Edit
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            leftIcon={<X className="h-4 w-4" />}
          >
            Close
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prescription Information */}
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-3">
              <FileText className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="font-medium text-gray-900">Prescription Information</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Prescription ID:</span>
                <span className="font-medium">{prescriptionDetails.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date:</span>
                <span className="font-medium">{new Date(prescriptionDetails.date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(prescriptionDetails.status)}`}>
                  {prescriptionDetails.status.charAt(0).toUpperCase() + prescriptionDetails.status.slice(1)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-3">
              <User className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="font-medium text-gray-900">Patient Information</h3>
            </div>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-500">Name:</span> {prescriptionDetails.patientName}</p>
              <p><span className="text-gray-500">Patient ID:</span> {prescriptionDetails.patientId}</p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-3">
              <Stethoscope className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="font-medium text-gray-900">Prescribing Doctor</h3>
            </div>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-500">Name:</span> Dr. {prescriptionDetails.doctorFirstName} {prescriptionDetails.doctorLastName}</p>
            </div>
          </div>
        </div>

        {/* Medications */}
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-4">
              <Pill className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="font-medium text-gray-900">Prescribed Medications</h3>
            </div>
            
            {prescriptionDetails.medications && prescriptionDetails.medications.length > 0 ? (
              <div className="space-y-4">
                {prescriptionDetails.medications.map((medication, index) => {
                  return (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium text-gray-900">
                          {medication.medicineName || 'Unknown Medicine'}
                        </h4>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {medication.dosageForm || 'N/A'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500">Dosage:</span>
                          <p className="font-medium">{medication.dosage}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Frequency:</span>
                          <p className="font-medium">{medication.frequency}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Duration:</span>
                          <p className="font-medium">{medication.duration}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Quantity:</span>
                          <p className="font-medium">{medication.quantity}</p>
                        </div>
                      </div>
                      
                      {medication.instructions && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <span className="text-gray-500 text-sm">Instructions:</span>
                          <p className="text-sm text-gray-700 mt-1">{medication.instructions}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No medications prescribed</p>
            )}
          </div>

          {prescriptionDetails.notes && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Additional Notes</h3>
              <p className="text-sm text-gray-700">{prescriptionDetails.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Print/Export Actions */}
      <div className="flex justify-end space-x-4 pt-6 border-t">
        <Button
          variant="outline"
          onClick={() => window.print()}
        >
          Print Prescription
        </Button>
        <Button
          variant="outline"
          onClick={() => alert('Export functionality would be implemented here')}
        >
          Export PDF
        </Button>
      </div>
    </div>
  );
};

export default ViewPrescription;