import React, { useEffect, useState } from 'react'; 
import { FileText, Plus, Search, Filter, Edit2, Eye, X, Trash2 } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Button from '../components/ui/Button';
import AddMedicalRecordForm from '../components/medical-records/AddMedicalRecordForm';
import EditMedicalRecordForm from '../components/medical-records/EditMedicalRecordForm';
import ViewMedicalRecord from '../components/medical-records/ViewMedicalRecord';
import { useAuth } from '../context/AuthContext';
import {
  fetchMedicalRecords,
  addMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
} from '../api/medicalRecordsApi';
import type { MedicalRecord } from '../types';

const MedicalRecordsPage: React.FC = () => {
  const { user } = useAuth();

  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [viewingRecord, setViewingRecord] = useState<MedicalRecord | null>(null);
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<MedicalRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    doctorId: '',
    diagnosis: '',
  });

  // Assuming patients and doctors come from API or global state
  // Here we fetch them from endpoints for this example
  const [patients, setPatients] = useState<{ id: string; name: string }[]>([]);
  const [doctors, setDoctors] = useState<{ id: string; firstName: string; lastName: string }[]>([]);

  useEffect(() => {
    loadRecords();
    loadPatients();
    loadDoctors();
  }, []);

const loadRecords = async () => {
  try {
    setIsLoading(true);
    let data;
    
    if (user?.role === 'doctor') {
      const res = await fetch(`http://localhost:5000/api/medical-records/doctor/${user.id}`, {
        headers: {
          'user-id': user.id // Temporary - use proper auth headers in production
        }
      });
      if (!res.ok) throw new Error('Failed to fetch doctor records');
      data = await res.json();
    } else {
      const res = await fetch('http://localhost:5000/api/medical-records');
      if (!res.ok) throw new Error('Failed to fetch records');
      data = await res.json();
    }
    
    setMedicalRecords(data);
  } catch (err: any) {
    console.error('Error loading records:', err);
    alert(err.message);
  } finally {
    setIsLoading(false);
  }
};

  const loadPatients = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/patients');
      if (!res.ok) throw new Error('Failed to load patients');
      const data = await res.json();
      // Make sure id is string
      const formatted = data.map((p: any) => ({
        ...p,
        id: String(p.id),
      }));
      setPatients(formatted);
    } catch (err) {
      console.error(err);
    }
  };

  const loadDoctors = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/doctors');
    if (!res.ok) throw new Error('Failed to load doctors');
    const data = await res.json();
    const formatted = data.map((d: any) => ({
      ...d,
      id: String(d.id),
    }));
    setDoctors(formatted);
  } catch (err) {
    console.error('Error loading doctors:', err);
    // Optional: set some state to show error in UI
  }
};

 const handleAddRecord = async (newRecord: MedicalRecord) => {
  try {
    const recordWithDoctor = {
      ...newRecord,
      doctorId: user?.id // Add current user's ID as doctorId
    };
    const savedRecord = await addMedicalRecord(recordWithDoctor);
    setMedicalRecords((prev) => [...prev, savedRecord]);
    setIsAddingRecord(false);
  } catch (err: any) {
    alert(err.message);
  }
};

  const handleSaveRecord = async (updatedRecord: MedicalRecord) => {
    try {
      await updateMedicalRecord(updatedRecord.id, updatedRecord);
      setMedicalRecords((prev) =>
        prev.map((r) => (r.id === updatedRecord.id ? updatedRecord : r))
      );
      setEditingRecord(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteRecord = async () => {
    if (!recordToDelete) return;
    try {
      await deleteMedicalRecord(recordToDelete.id);
      setMedicalRecords((prev) => prev.filter((r) => r.id !== recordToDelete.id));
      setRecordToDelete(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      doctorId: '',
      diagnosis: '',
    });
    setShowFilters(false);
  };

  const filteredRecords = medicalRecords.filter((record) => {
    const patient = patients.find((p) => String(p.id) === String(record.patientId));
    const searchString = `${patient?.name} ${record.diagnosis}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());

    const matchesDateRange =
      (!filters.startDate || record.date >= filters.startDate) &&
      (!filters.endDate || record.date <= filters.endDate);

    const matchesDoctor = !filters.doctorId || String(record.doctorId) === String(filters.doctorId);

    const matchesDiagnosis =
      !filters.diagnosis ||
      record.diagnosis.toLowerCase().includes(filters.diagnosis.toLowerCase());

    return matchesSearch && matchesDateRange && matchesDoctor && matchesDiagnosis;
  });

  const renderContent = () => {
    if (viewingRecord) {
      return <ViewMedicalRecord record={viewingRecord} onClose={() => setViewingRecord(null)} />;
    }

    if (isAddingRecord) {
      return (
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Add New Medical Record</h2>
          <AddMedicalRecordForm onSave={handleAddRecord} onCancel={() => setIsAddingRecord(false)} />
        </div>
      );
    }

    if (editingRecord) {
      return (
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Edit Medical Record</h2>
          <EditMedicalRecordForm
            record={editingRecord}
            onSave={handleSaveRecord}
            onCancel={() => setEditingRecord(null)}
          />
        </div>
      );
    }

    if (isLoading) {
      return <p className="p-6">Loading...</p>;
    }

    return (
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
              const patient = patients.find((p) => String(p.id) === String(record.patientId));
              const doctor = doctors.find((d) => String(d.id) === String(record.doctorId));

              return (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
  <div className="flex items-center">
    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
      <span className="font-medium text-sm">
        {patient?.name?.[0]}
      </span>
    </div>
    <div className="ml-4">
      <div className="text-sm font-medium text-gray-900">
        {patient?.name || 'Unknown Patient'}
      </div>
      <div className="text-sm text-gray-500">Patient ID: {patient?.id || 'N/A'}</div>
    </div>
  </div>
</td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user && String(record.doctorId) === String(user.id)
                      ? `Dr. ${user.name}`
                      : doctor
                      ? `Dr. ${doctor.firstName} ${doctor.lastName}`
                      : 'Unknown Doctor'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{record.diagnosis}</div>
                    <div className="text-sm text-gray-500">
                      {record.symptoms?.slice(0, 2).join(', ')}
                      {record.symptoms && record.symptoms.length > 2 && '...'}
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
                      onClick={() => setViewingRecord(record)}
                    >
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mr-2"
                      leftIcon={<Edit2 className="h-4 w-4" />}
                      onClick={() => setEditingRecord(record)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                      leftIcon={<Trash2 className="h-4 w-4" />}
                      onClick={() => setRecordToDelete(record)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
                <h1 className="text-3xl font-bold text-gray-900">Medical Records</h1>
              </div>
              <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setIsAddingRecord(true)}>
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
                onClick={() => setShowFilters(!showFilters)}
              >
                Filter
              </Button>
            </div>

            {showFilters && (
              <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Filters</h3>
                  <Button variant="ghost" size="sm" leftIcon={<X className="h-4 w-4" />} onClick={resetFilters}>
                    Reset
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={filters.startDate}
                      onChange={handleFilterChange}
                      className="w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={filters.endDate}
                      onChange={handleFilterChange}
                      className="w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
                    <select
                      name="doctorId"
                      value={filters.doctorId}
                      onChange={handleFilterChange}
                      className="w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Doctors</option>
                      {doctors.map((doctor) => (
                        <option key={doctor.id} value={doctor.id}>
                          Dr. {doctor.firstName} {doctor.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
                    <input
                      type="text"
                      name="diagnosis"
                      value={filters.diagnosis}
                      onChange={handleFilterChange}
                      placeholder="Filter by diagnosis..."
                      className="w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white shadow-md rounded-lg overflow-hidden">{renderContent()}</div>

            {/* Delete Confirmation Modal */}
            {recordToDelete && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Medical Record</h3>
                  <p className="text-gray-500 mb-6">
                    Are you sure you want to delete this medical record? This action cannot be undone.
                  </p>
                  <div className="flex justify-end space-x-4">
                    <Button variant="outline" onClick={() => setRecordToDelete(null)}>
                      Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDeleteRecord}>
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MedicalRecordsPage;
