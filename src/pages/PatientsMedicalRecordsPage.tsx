// PatientMedicalRecordsPage.tsx
import React, { useEffect, useState } from 'react'; 
import { FileText, Search, Eye, RefreshCw, User } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Button from '../components/ui/Button';
import ViewMedicalRecord from '../components/medical-records/ViewMedicalRecord';
import { useAuth } from '../context/AuthContext';
import type { MedicalRecord } from '../types';

const PatientMedicalRecordsPage: React.FC = () => {
  const { user } = useAuth();

  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewingRecord, setViewingRecord] = useState<MedicalRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [doctors, setDoctors] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    loadRecords();
    loadDoctors();
  }, [user?.id]);

  const loadRecords = async () => {
    try {
      setIsLoading(true);
      
      // Fetch only the current patient's medical records
      const res = await fetch(`http://localhost:5000/api/medical-records/patient/${user?.id}`);
      if (!res.ok) throw new Error('Failed to fetch medical records');
      
      const data = await res.json();
      setMedicalRecords(data);
    } catch (err: any) {
      console.error('Error loading records:', err);
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDoctors = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/doctors');
      if (!res.ok) throw new Error('Failed to load doctors');
      const data = await res.json();
      
      const formatted = data.map((d: any) => ({
        id: String(d.id),
        name: d.name || `${d.firstName} ${d.lastName}` || 'Unknown Doctor'
      }));
      
      setDoctors(formatted);
    } catch (err) {
      console.error('Error loading doctors:', err);
    }
  };

  const filteredRecords = medicalRecords.filter((record) => {
    const searchString = `${record.diagnosis || ''} ${record.symptoms?.join(' ') || ''}`.toLowerCase();
    const matchesSearch = searchTerm === '' || searchString.includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const renderContent = () => {
    if (viewingRecord) {
      return <ViewMedicalRecord record={viewingRecord} onClose={() => setViewingRecord(null)} />;
    }

    if (isLoading) {
      return (
        <div className="p-6 text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-2 text-gray-600">Loading your medical records...</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        {filteredRecords.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No medical records found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search terms' : 'You don\'t have any medical records yet'}
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doctor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Diagnosis
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Symptoms
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.map((record) => {
                const doctor = doctors.find((d) => String(d.id) === String(record.doctorId));

                return (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                          <User className="h-5 w-5" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {doctor?.name || 'Unknown Doctor'}
                          </div>
                          <div className="text-sm text-gray-500">Medical Professional</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{record.diagnosis}</div>
                      {record.treatment && (
                        <div className="text-sm text-gray-500 mt-1">
                          Treatment: {record.treatment}
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {record.symptoms?.slice(0, 3).join(', ')}
                        {record.symptoms && record.symptoms.length > 3 && '...'}
                      </div>
                      {record.symptoms && record.symptoms.length > 3 && (
                        <div className="text-xs text-gray-500 mt-1">
                          +{record.symptoms.length - 3} more symptoms
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{new Date(record.date).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(record.date).toLocaleTimeString()}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Eye className="h-4 w-4" />}
                        onClick={() => setViewingRecord(record)}
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    );
  };

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
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">My Medical Records</h1>
                  <p className="text-gray-600 mt-1">
                    View your complete medical history and records
                    {filteredRecords.length > 0 && ` • ${filteredRecords.length} records`}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="search"
                  placeholder="Search by diagnosis or symptoms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button
                variant="outline"
                leftIcon={<RefreshCw className="h-4 w-4" />}
                onClick={loadRecords}
                disabled={isLoading}
              >
                Refresh
              </Button>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PatientMedicalRecordsPage;