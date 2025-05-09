import React, { useState } from 'react';
import { FileText, Plus, Search, Filter, Edit2, Eye } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Button from '../components/ui/Button';
import EditMedicalRecordForm from '../components/medical-records/EditMedicalRecordForm';
import AddMedicalRecordForm from '../components/medical-records/AddMedicalRecordForm';
import { useAuth } from '../context/AuthContext';
import { medicalRecords, patients, doctors } from '../utils/mockData';
import type { MedicalRecord } from '../types';

const MedicalRecordsPage: React.FC = () => {
  const { user } = useAuth();
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSaveRecord = (updatedRecord: MedicalRecord) => {
    // In a real app, this would make an API call to update the record
    const recordIndex = medicalRecords.findIndex(r => r.id === updatedRecord.id);
    if (recordIndex !== -1) {
      medicalRecords[recordIndex] = updatedRecord;
    }
    setEditingRecord(null);
  };

  const handleAddRecord = (newRecord: MedicalRecord) => {
    // In a real app, this would make an API call to create the record
    medicalRecords.push(newRecord);
    setIsAddingRecord(false);
  };

  const filteredRecords = medicalRecords.filter(record => {
    const patient = patients.find(p => p.id === record.patientId);
    const searchString = `${patient?.firstName} ${patient?.lastName} ${record.diagnosis}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">Medical Records</h1>
              </div>
              <Button 
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => setIsAddingRecord(true)}
              >
                Add New Record
              </Button>
            </div>

            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="search"
                  placeholder="Search records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button
                variant="outline"
                leftIcon={<Filter className="h-4 w-4" />}
              >
                Filter
              </Button>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              {isAddingRecord ? (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Add New Medical Record</h2>
                  <AddMedicalRecordForm
                    onSave={handleAddRecord}
                    onCancel={() => setIsAddingRecord(false)}
                  />
                </div>
              ) : editingRecord ? (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Edit Medical Record</h2>
                  <EditMedicalRecordForm
                    record={editingRecord}
                    onSave={handleSaveRecord}
                    onCancel={() => setEditingRecord(null)}
                  />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Patient
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Doctor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Diagnosis
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Updated
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredRecords.map((record) => {
                        const patient = patients.find(p => p.id === record.patientId);
                        const doctor = doctors.find(d => d.id === record.doctorId);
                        
                        return (
                          <tr key={record.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                  <span className="font-medium text-sm">
                                    {patient?.firstName[0]}{patient?.lastName[0]}
                                  </span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {patient?.firstName} {patient?.lastName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    ID: {patient?.id}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">Dr. {doctor?.firstName} {doctor?.lastName}</div>
                              <div className="text-sm text-gray-500">{doctor?.specialization}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">{record.diagnosis}</div>
                              <div className="text-sm text-gray-500">
                                {record.symptoms.slice(0, 2).join(', ')}
                                {record.symptoms.length > 2 && '...'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(record.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(record.lastUpdated || record.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Button
                                variant="outline"
                                size="sm"
                                className="mr-2"
                                leftIcon={<Eye className="h-4 w-4" />}
                              >
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                leftIcon={<Edit2 className="h-4 w-4" />}
                                onClick={() => setEditingRecord(record)}
                              >
                                Edit
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MedicalRecordsPage;