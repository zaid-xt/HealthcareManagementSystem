// PatientsPage.tsx
import React, { useState, useEffect } from 'react';
import { User, Search, Filter, FileText, Plus, Edit2, Trash2, Eye, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Button from '../components/ui/Button';
import AddPatientForm from '../components/patients/AddPatientForm';
import EditPatientForm from '../components/patients/EditPatientForm';
import ViewPatient from '../components/patients/ViewPatient';
import AddMedicalRecordForm from '../components/medical-records/AddMedicalRecordForm';
import { fetchPatients, createPatient, updatePatient, deletePatient, type PatientUser } from '../api/patientsApi';
import type { Patient, MedicalRecord } from '../types';

const PatientsPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isDoctor = user?.role === 'doctor';
  const canManagePatients = isAdmin || isDoctor;
  
  const [patients, setPatients] = useState<PatientUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingPatient, setIsAddingPatient] = useState(false);
  const [editingPatient, setEditingPatient] = useState<PatientUser | null>(null);
  const [viewingPatient, setViewingPatient] = useState<PatientUser | null>(null);
  const [isAddingMedicalRecord, setIsAddingMedicalRecord] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    gender: '',
    bloodType: '',
    ageRange: ''
  });
  const [patientToDelete, setPatientToDelete] = useState<PatientUser | null>(null);

  // Fetch patients from API
  const loadPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const patientsData = await fetchPatients();
      setPatients(patientsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load patients');
      console.error('Error loading patients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const handleAddPatient = async (patientData: Omit<PatientUser, 'id'>) => {
    try {
      const newPatient = await createPatient(patientData);
      setPatients(prev => [...prev, newPatient]);
      setIsAddingPatient(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create patient');
      throw err; // Re-throw to let form handle it
    }
  };

  const handleUpdatePatient = async (updatedPatient: PatientUser) => {
    try {
      const result = await updatePatient(updatedPatient.id, updatedPatient);
      setPatients(prev => prev.map(p => p.id === updatedPatient.id ? result : p));
      setEditingPatient(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update patient');
      throw err; // Re-throw to let form handle it
    }
  };

  const handleDeletePatient = async () => {
    if (!patientToDelete) return;
    
    try {
      await deletePatient(patientToDelete.id);
      setPatients(prev => prev.filter(p => p.id !== patientToDelete.id));
      setPatientToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete patient');
    }
  };

  const handleAddMedicalRecord = (newRecord: MedicalRecord) => {
    // In a real app, this would make an API call
    console.log('New medical record:', newRecord);
    setIsAddingMedicalRecord(false);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      gender: '',
      bloodType: '',
      ageRange: ''
    });
    setShowFilters(false);
  };

  // Extract first and last name from full name for display
  const getNameParts = (name: string) => {
    const parts = name.split(' ');
    return {
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' ') || '',
      initials: (parts[0]?.[0] || '') + (parts[1]?.[0] || '')
    };
  };

  const filteredPatients = patients.filter(patient => {
    const searchString = `${patient.name} ${patient.email} ${patient.contactNumber} ${patient.idNumber}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    
    // Note: These filters will work once you add the fields to your database
    const matchesGender = !filters.gender || patient.gender === filters.gender;
    const matchesBloodType = !filters.bloodType || patient.bloodType === filters.bloodType;
    const matchesAgeRange = true; // Age calculation requires dateOfBirth field
    
    return matchesSearch && matchesGender && matchesBloodType && matchesAgeRange;
  });

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading patients...</span>
        </div>
      );
    }

    if (error && !loading) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <div className="text-red-800">{error}</div>
            <Button variant="outline" size="sm" onClick={loadPatients}>
              Retry
            </Button>
          </div>
        </div>
      );
    }

    if (viewingPatient) {
      return (
        <ViewPatient
          patient={viewingPatient}
          onClose={() => setViewingPatient(null)}
          onAddMedicalRecord={() => setIsAddingMedicalRecord(true)}
        />
      );
    }

    if (isAddingMedicalRecord && viewingPatient) {
      return (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Add Medical Record for {viewingPatient.name}
          </h2>
          <AddMedicalRecordForm
            onSave={handleAddMedicalRecord}
            onCancel={() => setIsAddingMedicalRecord(false)}
            preselectedPatientId={viewingPatient.id}
          />
        </div>
      );
    }

    if (isAddingPatient) {
      return (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Add New Patient</h2>
          <AddPatientForm
            onSave={handleAddPatient}
            onCancel={() => setIsAddingPatient(false)}
          />
        </div>
      );
    }

    if (editingPatient) {
      return (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Edit Patient</h2>
          <EditPatientForm
            patient={editingPatient}
            onSave={handleUpdatePatient}
            onCancel={() => setEditingPatient(null)}
          />
        </div>
      );
    }

    return (
      <>
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="search"
              placeholder="Search patients by name, email, phone, or ID number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button
            variant="outline"
            leftIcon={<RefreshCw className="h-4 w-4" />}
            onClick={loadPatients}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>

<div className="bg-white shadow-md rounded-lg overflow-hidden">
  {filteredPatients.length === 0 ? (
    <div className="text-center py-12">
      <User className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">No patients found</h3>
      <p className="mt-1 text-sm text-gray-500">
        {searchTerm || Object.values(filters).some(f => f) 
          ? 'Try adjusting your search or filters' 
          : 'Get started by creating a new patient'}
      </p>
      {canManagePatients && (
        <div className="mt-6">
          <Button
            onClick={() => setIsAddingPatient(true)}
            leftIcon={<Plus className="h-4 w-4" />}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Add New Patient
          </Button>
        </div>
      )}
    </div>
  ) : (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Patient
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Contact Information
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            ID Number
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Role
          </th>
          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {filteredPatients.map((patient) => {
          const { initials } = getNameParts(patient.name);
          
          return (
            <tr key={patient.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <span className="font-medium text-sm">{initials}</span>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {patient.name}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{patient.contactNumber}</div>
                <div className="text-sm text-gray-500">{patient.email}</div>
                {patient.address && (
                  <div className="text-sm text-gray-500 truncate max-w-xs">
                    {patient.address}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded border">
                  {patient.idNumber}
                </div>
                {patient.doctorId && (
                  <div className="text-xs text-gray-500 mt-1">
                    Doctor ID: {patient.doctorId}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  patient.role === 'patient' 
                    ? 'bg-green-100 text-green-800'
                    : patient.role === 'doctor'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {patient.role.charAt(0).toUpperCase() + patient.role.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Eye className="h-4 w-4" />}
                    onClick={() => setViewingPatient(patient)}
                  >
                    View
                  </Button>
                  {isDoctor && (
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<FileText className="h-4 w-4" />}
                      onClick={() => {
                        setViewingPatient(patient);
                        // Auto-switch to records tab when clicking Records button
                        setTimeout(() => {
                          const recordsTab = document.querySelector('[data-tab="records"]') as HTMLButtonElement;
                          if (recordsTab) recordsTab.click();
                        }, 100);
                      }}
                    >
                      Records
                    </Button>
                  )}
                  {isAdmin && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Edit2 className="h-4 w-4" />}
                        onClick={() => setEditingPatient(patient)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        leftIcon={<Trash2 className="h-4 w-4" />}
                        onClick={() => setPatientToDelete(patient)}
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  )}
</div>
      </>
    );
  };

  if (!canManagePatients) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="max-w-7xl mx-auto text-center py-12">
              <h2 className="text-2xl font-semibold text-gray-900">Access Restricted</h2>
              <p className="mt-2 text-gray-600">Only administrators and doctors can view this page.</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <User className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
                  <p className="text-gray-600 mt-1">
                    {loading ? 'Loading...' : `${filteredPatients.length} of ${patients.length} patients`}
                  </p>
                </div>
              </div>

              {/* {canManagePatients && (
                <Button
                  onClick={() => setIsAddingPatient(true)}
                  leftIcon={<Plus className="h-4 w-4" />}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Add New Patient
                </Button>
              )} */}
            </div>

            {renderContent()}

            {/* Delete Confirmation Modal */}
            {patientToDelete && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Delete Patient Record
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Are you sure you want to delete {patientToDelete.name}'s record? This action cannot be undone.
                  </p>
                  <div className="flex justify-end space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => setPatientToDelete(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="danger"
                      onClick={handleDeletePatient}
                    >
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

export default PatientsPage;