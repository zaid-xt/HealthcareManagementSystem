import React, { useEffect, useState } from 'react';
import { X, Calendar, User, Stethoscope, FileText, Download, Printer } from 'lucide-react';
import Button from '../ui/Button';
import type { Lab } from '../../types';

interface ViewLabResultFormProps {
  lab: Lab;
  onClose: () => void;
}

const ViewLabResultForm: React.FC<ViewLabResultFormProps> = ({ lab, onClose }) => {
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

  // Patient lookup
  const patient = patients.find((p) => String(p.id) === String(lab.patientId));

  // Doctor lookup
  const doctor = doctors.find(
    (d) => d.doctorId === lab.doctorId || String(d.id) === String(lab.doctorId)
  );

  // Format status with proper styling
  const getStatusDisplay = (status: Lab['status']) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
    };
    
    const config = statusConfig[status];
    return (
      <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // Handle print functionality
  const handlePrint = () => {
    window.print();
  };

  // Handle download functionality
  const handleDownload = () => {
    const content = `
LAB RESULT REPORT
=================

Test Type: ${lab.testType}
Date: ${new Date(lab.date).toLocaleDateString()}
Status: ${lab.status.charAt(0).toUpperCase() + lab.status.slice(1)}
Patient: ${patient?.name || 'Unknown'}
Patient ID: ${lab.patientId}
Doctor: ${doctor?.name || 'Unknown'}
Doctor ID: ${lab.doctorId}

RESULTS:
${lab.results || 'No results available'}

Report Generated: ${new Date().toLocaleDateString()}
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lab-result-${lab.testType.toLowerCase().replace(/\s+/g, '-')}-${lab.date.split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <h2 className="text-xl font-semibold text-gray-900">Lab Result Details</h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="h-4 w-4" />}
            className="print:hidden"
          >
            Print
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            leftIcon={<Download className="h-4 w-4" />}
            className="print:hidden"
          >
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            leftIcon={<X className="h-4 w-4" />}
            className="print:hidden"
          >
            Close
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Patient Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <User className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="font-medium text-gray-900">Patient Information</h3>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <p><span className="font-medium">Name:</span> {patient?.name || 'Unknown'}</p>
            <p><span className="font-medium">ID Number:</span> {patient?.idNumber || 'N/A'}</p>
            <p><span className="font-medium">Contact Number:</span> {patient?.contactNumber || 'N/A'}</p>
            <p><span className="font-medium">Email:</span> {patient?.email || 'N/A'}</p>
          </div>
        </div>

        {/* Doctor Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <Stethoscope className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="font-medium text-gray-900">Doctor Information</h3>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <p><span className="font-medium">Name:</span> {doctor?.name || 'Unknown'}</p>
            <p><span className="font-medium">Contact Number:</span> {doctor?.contactNumber || 'N/A'}</p>
            <p><span className="font-medium">Email:</span> {doctor?.email || 'N/A'}</p>
          </div>
        </div>

        {/* Test Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <FileText className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="font-medium text-gray-900">Test Information</h3>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <p><span className="font-medium">Test Type:</span> {lab.testType}</p>
            <p><span className="font-medium">Status:</span> {getStatusDisplay(lab.status)}</p>
            <p><span className="font-medium">Requested By:</span> {(lab as any).requestedByName || 'Unknown'}</p>
          </div>
        </div>

        {/* Timeline Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <Calendar className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="font-medium text-gray-900">Timeline</h3>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <p><span className="font-medium">Test Date:</span> {new Date(lab.date).toLocaleDateString()}</p>
            <p><span className="font-medium">Last Updated:</span> {new Date((lab as any).updated_at || lab.date).toLocaleDateString()}</p>
            <p><span className="font-medium">Report ID:</span> {lab.id}</p>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center mb-2">
          <FileText className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="font-medium text-gray-900">Test Results</h3>
        </div>
        <div className="text-sm text-gray-600">
          {lab.results ? (
            <div className="bg-white p-4 rounded border">
              <pre className="whitespace-pre-wrap font-sans">{lab.results}</pre>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p>No results available</p>
              <p className="text-sm mt-1">
                {lab.status === 'pending' 
                  ? 'Results are pending and will be available soon.'
                  : 'No results have been recorded for this test.'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions - Hidden when printing */}
      <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 print:hidden">
        <Button
          variant="outline"
          onClick={onClose}
          leftIcon={<X className="h-4 w-4" />}
        >
          Close
        </Button>
        <Button
          variant="primary"
          onClick={handlePrint}
          leftIcon={<Printer className="h-4 w-4" />}
        >
          Print Report
        </Button>
      </div>
    </div>
  );
};

export default ViewLabResultForm;