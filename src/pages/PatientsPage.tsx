import React, { useState, useEffect } from 'react';
import { User, Search, Filter, FileText, Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Button from '../components/ui/Button';
import AddPatientForm from '../components/patients/AddPatientForm';
import EditPatientForm from '../components/patients/EditPatientForm';
import ViewPatient from '../components/patients/ViewPatient';
import AddMedicalRecordForm from '../components/medical-records/AddMedicalRecordForm';
import { doctors } from '../utils/mockData';
import type { Patient, MedicalRecord } from '../types';

const PatientsPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isDoctor = user?.role === 'doctor';
  const canManagePatients = isAdmin || isDoctor;
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingPatient, setIsAddingPatient] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [viewingPatient, setViewingPatient] = useState<Patient | null>(null);
  const [isAddingMedicalRecord, setIsAddingMedicalRecord] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    gender: '',
    bloodType: '',
    ageRange: ''
  });
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

  // Fetch patients from API
  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/patients');
      if (response.ok) {
        const data = await response.json();
        setPatients(data);
      } else {
        console.error('Failed to fetch patients');
        
        setPatients([]);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      setPatients([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPatient = async (patientData: Omit<Patient, 'id'>) => {
    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData),
      });

      if (response.ok) {
        const newPatient = await response.json();
        setPatients(prev => [...prev, newPatient]);
        setIsAddingPatient(false);
        alert('Patient added successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to add patient: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding patient:', error);
      alert('Error adding patient. Please check console for details.');
    }
  };

  const handleUpdatePatient = async (updatedPatient: Patient) => {
    try {
      const response = await fetch(`/api/patients/${updatedPatient.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPatient),
      });

      if (response.ok) {
        const updated = await response.json();
        setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updated : p));
        setEditingPatient(null);
        alert('Patient updated successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to update patient: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating patient:', error);
      alert('Error updating patient. Please check console for details.');
    }
  };

  const handleDeletePatient = async () => {
    if (!patientToDelete) return;
    
    try {
      const response = await fetch(`/api/patients/${patientToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPatients(prev => prev.filter(p => p.id !== patientToDelete.id));
        setPatientToDelete(null);
        alert('Patient deleted successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to delete patient: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting patient:', error);
      alert('Error deleting patient. Please check console for details.');
    }
  };

  const handleAddMedicalRecord = (newRecord: MedicalRecord) => {
  
    const { medicalRecords } = require('../utils/mockData');
    medicalRecords.push(newRecord);
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

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const filteredPatients = patients.filter(patient => {
    const searchString = `${patient.firstName} ${patient.lastName} ${patient.email}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    
    const matchesGender = !filters.gender || patient.gender === filters.gender;
    const matchesBloodType = !filters.bloodType || patient.bloodType === filters.bloodType;
    
    let matchesAgeRange = true;
    if (filters.ageRange) {
      const age = calculateAge(patient.dateOfBirth);
      switch (filters.ageRange) {
        case '0-18':
          matchesAgeRange = age <= 18;
          break;
        case '19-30':
          matchesAgeRange = age > 18 && age <= 30;
          break;
        case '31-50':
          matchesAgeRange = age > 30 && age <= 50;
          break;
        case '51+':
          matchesAgeRange = age > 50;
          break;
      }
    }
    
    return matchesSearch && matchesGender && matchesBloodType && matchesAgeRange;
  });

  const renderContent = () => {
    if (viewingPatient) {
      return (
        <ViewPatient
          patient={viewingPatient}
          onClose={() => setViewingPatient(null)}
          onAddMedicalRecord={() => setIsAddingMedicalRecord(true)}
        />
      );
    }

//{isAddingMedicalRecord && viewingPatient && (
 // <div className="bg-white rounded-lg shadow-md p-6">
   // <h2 className="text-xl font-semibold text-gray-900 mb-6">
     // Add Medical Record for {viewingPatient.firstName} {viewingPatient.lastName}
    //</h2>
    //<AddMedicalRecordForm
      //onSave={handleAddMedicalRecord}
      //onCancel={() => setIsAddingMedicalRecord(false)}
      //preselectedPatientId={viewingPatient.id}
    ///>
  //</div>
//)}



if (isAddingMedicalRecord && !viewingPatient) {
  return (
    <div className="text-center py-8">
      <p className="text-gray-500">Loading patient information...</p>
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
              placeholder="Search patients..."
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  name="gender"
                  value={filters.gender}
                  onChange={handleFilterChange}
                  className="w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blood Type
                </label>
                <select
                  name="bloodType"
                  value={filters.bloodType}
                  onChange={handleFilterChange}
                  className="w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age Range
                </label>
                <select
                  name="ageRange"
                  value={filters.ageRange}
                  onChange={handleFilterChange}
                  className="w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All</option>
                  <option value="0-18">0-18 years</option>
                  <option value="19-30">19-30 years</option>
                  <option value="31-50">31-50 years</option>
                  <option value="51+">51+ years</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                  fullWidth
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned Doctor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Medical Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Emergency Contact
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.map((patient) => {
                  const assignedDoctor = doctors.find(d => d.id === patient.doctorId);
                  
                  return (
                    <tr key={patient.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <span className="font-medium text-sm">
                              {patient.firstName[0]}{patient.lastName[0]}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {patient.firstName} {patient.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {patient.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {assignedDoctor ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              Dr. {assignedDoctor.firstName} {assignedDoctor.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {assignedDoctor.id}
                            </div>
                            <div className="text-sm text-gray-500">
                              {assignedDoctor.specialization}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">
                            No doctor assigned
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          Age: {calculateAge(patient.dateOfBirth)} years
                        </div>
                        <div className="text-sm text-gray-500">
                          Blood Type: {patient.bloodType || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          Gender: {patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{patient.contactNumber}</div>
                        <div className="text-sm text-gray-500">{patient.email}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {patient.address}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {patient.emergencyContact.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {patient.emergencyContact.relation}
                        </div>
                        <div className="text-sm text-gray-500">
                          {patient.emergencyContact.contactNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant="outline"
                          size="sm"
                          className="mr-2"
                          leftIcon={<Eye className="h-4 w-4" />}
                          onClick={() => setViewingPatient(patient)}
                        >
                          View
                        </Button>
                        {isDoctor && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mr-2"
                            leftIcon={<FileText className="h-4 w-4" />}
                            onClick={() => {
                              setViewingPatient(patient);
                            
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
                              className="mr-2"
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
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="max-w-7xl mx-auto text-center py-12">
              <p className="text-gray-600">Loading patients...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

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
                <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
              </div>

              {canManagePatients && (
                <Button
                  onClick={() => setIsAddingPatient(true)}
                  leftIcon={<Plus className="h-4 w-4" />}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Add New Patient
                </Button>
              )}
            </div>

            {renderContent()}

           
            {patientToDelete && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Delete Patient Record
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Are you sure you want to delete {patientToDelete.firstName} {patientToDelete.lastName}'s record? This action cannot be undone.
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