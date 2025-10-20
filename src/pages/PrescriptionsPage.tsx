import React, { useState, useEffect } from 'react';
import { Pill, Plus, Search, Filter, Edit2, Eye, Trash2, User, Calendar } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Button from '../components/ui/Button';
import AddPrescriptionForm from '../components/prescriptions/AddPrescriptionForm';
import EditPrescriptionForm from '../components/prescriptions/EditPrescriptionForm';
import ViewPrescription from '../components/prescriptions/ViewPrescription';
import { useAuth } from '../context/AuthContext';
import { prescriptionAPI, type Prescription, type Medicine } from '../api/prescriptionApi';

const PrescriptionsPage: React.FC = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isAddingPrescription, setIsAddingPrescription] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);
  const [viewingPrescription, setViewingPrescription] = useState<Prescription | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    doctorId: '',
    startDate: '',
    endDate: ''
  });
  const [prescriptionToDelete, setPrescriptionToDelete] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data from API
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [prescriptionsData, medicinesData, patientsData, doctorsData] = await Promise.all([
        prescriptionAPI.getPrescriptions(),
        prescriptionAPI.getMedicines(),
        prescriptionAPI.getPatients(),
        prescriptionAPI.getDoctors()
      ]);

      // Build a map of patients by id for quick lookup
      const patientById = new Map<string, any>();
      patientsData.forEach((p: any) => patientById.set(p.id || p._id || String(p.patientId || ''), p));

      const getPatientIdNumber = (patient: any) => {
        if (!patient) return undefined;
        return patient.patientIdNumber ??
               patient.idNumber ??
               patient.id_number ??
               patient.nationalId ??
               patient.identityNumber ??
               patient.identity_number ??
               patient.idNo ??
               patient.documentId ??
               patient.identificationNumber ??
               patient.id ??
               patient._id;
      };

      // Attach resolved patient fields to prescriptions as fallbacks
      const enhancedPrescriptions = prescriptionsData.map((presc: any) => {
        const patient = patientById.get(presc.patientId);
        const idNumberFromPatient = getPatientIdNumber(patient);
        return {
          ...presc,
          // keep existing explicit fields, but fall back to patient join
          patientName: presc.patientName || (patient?.name || `${patient?.firstName || ''} ${patient?.lastName || ''}`.trim()),
          patientIdNumber: presc.patientIdNumber || idNumberFromPatient || presc.patientId,
          patientContact: presc.patientContact || patient?.phone || patient?.mobile || patient?.contactNumber,
          patientEmail: presc.patientEmail || patient?.email,
        } as Prescription;
      });

      console.log('Loaded prescriptions (enhanced):', enhancedPrescriptions);
      
      setPrescriptions(enhancedPrescriptions);
      setMedicines(medicinesData);
      setPatients(patientsData);
      setDoctors(doctorsData);
    } catch (error: any) {
      console.error('Failed to load data:', error);
      setError(error.message || 'Failed to load prescriptions data');
    } finally {
      setLoading(false);
    }
  };

  // Filter prescriptions based on user role
  const filteredPrescriptions = prescriptions.filter(prescription => {
    // Role-based filtering
    if (user?.role === 'patient') {
      // Patients can only see their own prescriptions
      if (prescription.patientId !== user.id) return false;
    } else if (user?.role === 'doctor') {
      // Doctors can only see prescriptions they created
      if (prescription.doctorId !== user.id) return false;
    }
    // Admins can see all prescriptions

    // Search filtering
    const searchString = `${prescription.patientName || ''} ${prescription.doctorName || ''}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());

    // Status filtering
    const matchesStatus = !filters.status || prescription.status === filters.status;

    // Doctor filtering
    const matchesDoctor = !filters.doctorId || prescription.doctorId === filters.doctorId;

    // Date filtering
    const matchesDateRange = 
      (!filters.startDate || prescription.date >= filters.startDate) &&
      (!filters.endDate || prescription.date <= filters.endDate);

    return matchesSearch && matchesStatus && matchesDoctor && matchesDateRange;
  });

  const handleAddPrescription = async (newPrescription: any) => {
    try {
      setError(null);
      const createdPrescription = await prescriptionAPI.createPrescription({
        ...newPrescription,
        createdBy: user?.id || ''
      });
      setPrescriptions(prev => [createdPrescription, ...prev]);
      setIsAddingPrescription(false);
    } catch (error: any) {
      console.error('Failed to create prescription:', error);
      setError(error.message || 'Failed to create prescription');
    }
  };

  const handleUpdatePrescription = async (updatedPrescription: Prescription) => {
    try {
      setError(null);
      const { id, patientId, doctorId, date, status, notes, medications } = updatedPrescription;
      const result = await prescriptionAPI.updatePrescription(id, {
        patientId,
        doctorId,
        date,
        status,
        notes,
        medications
      });
      setPrescriptions(prev => prev.map(p => p.id === result.id ? result : p));
      setEditingPrescription(null);
    } catch (error: any) {
      console.error('Failed to update prescription:', error);
      setError(error.message || 'Failed to update prescription');
    }
  };

  const handleDeletePrescription = async () => {
    if (!prescriptionToDelete) return;
    
    try {
      setError(null);
      await prescriptionAPI.deletePrescription(prescriptionToDelete.id);
      setPrescriptions(prev => prev.filter(p => p.id !== prescriptionToDelete.id));
      setPrescriptionToDelete(null);
    } catch (error: any) {
      console.error('Failed to delete prescription:', error);
      setError(error.message || 'Failed to delete prescription');
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      status: '',
      doctorId: '',
      startDate: '',
      endDate: ''
    });
    setShowFilters(false);
  };

  const getStatusColor = (status: Prescription['status']) => {
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

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading prescriptions...</p>
          </div>
        </div>
      );
    }

    if (error && !isAddingPrescription && !editingPrescription && !viewingPrescription) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="text-red-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={loadData}
                className="text-red-800 hover:text-red-900 text-sm font-medium"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (viewingPrescription) {
      return (
        <ViewPrescription
          prescription={viewingPrescription}
          onClose={() => setViewingPrescription(null)}
          onEdit={() => {
            setEditingPrescription(viewingPrescription);
            setViewingPrescription(null);
          }}
        />
      );
    }

    if (isAddingPrescription) {
      return (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Create New Prescription</h2>
          <AddPrescriptionForm
            onSave={handleAddPrescription}
            onCancel={() => setIsAddingPrescription(false)}
          />
        </div>
      );
    }

    if (editingPrescription) {
      return (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Edit Prescription</h2>
          <EditPrescriptionForm
            prescription={editingPrescription}
            onSave={handleUpdatePrescription}
            onCancel={() => setEditingPrescription(null)}
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
              placeholder="Search prescriptions by patient or doctor name..."
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
          <Button
            variant="outline"
            onClick={loadData}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>

        {showFilters && (
          <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Filters</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
              >
                Reset
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              {user?.role === 'admin' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
                  <select
                    name="doctorId"
                    value={filters.doctorId}
                    onChange={handleFilterChange}
                    className="w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Doctors</option>
                    {doctors.map(doctor => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
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
            </div>
          </div>
        )}

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {filteredPrescriptions.length > 0 ? (
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
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Medications
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPrescriptions.map((prescription) => {
                    const prescriptionMedications = prescription.medications || [];
                    
                    return (
                      <tr key={prescription.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                              <span className="font-medium text-sm">
                                {prescription.patientName?.charAt(0) || 'P'}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {prescription.patientName}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {prescription.patientIdNumber}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {prescription.doctorName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {prescription.specialization}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(prescription.date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {prescriptionMedications.length} medication(s)
                          </div>
                          <div className="text-sm text-gray-500">
                            {prescriptionMedications.slice(0, 2).map(ol => 
                              ol.medicineName
                            ).filter(Boolean).join(', ')}
                            {prescriptionMedications.length > 2 && '...'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(prescription.status)}`}>
                            {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button
                            variant="outline"
                            size="sm"
                            className="mr-2"
                            leftIcon={<Eye className="h-4 w-4" />}
                            onClick={() => setViewingPrescription(prescription)}
                          >
                            View
                          </Button>
                          {(user?.role === 'doctor' && prescription.doctorId === user.id) || user?.role === 'admin' ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mr-2"
                                leftIcon={<Edit2 className="h-4 w-4" />}
                                onClick={() => setEditingPrescription(prescription)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:bg-red-50"
                                leftIcon={<Trash2 className="h-4 w-4" />}
                                onClick={() => setPrescriptionToDelete(prescription)}
                              >
                                Delete
                              </Button>
                            </>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Pill className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No prescriptions found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || Object.values(filters).some(f => f) 
                  ? 'Try adjusting your search or filters.' 
                  : 'Get started by creating a new prescription.'}
              </p>
              {(user?.role === 'doctor' || user?.role === 'admin') && !searchTerm && !Object.values(filters).some(f => f) && (
                <div className="mt-6">
                  <Button
                    onClick={() => setIsAddingPrescription(true)}
                    leftIcon={<Plus className="h-4 w-4" />}
                  >
                    Create Prescription
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </>
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
                <Pill className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">Prescriptions</h1>
              </div>
              {(user?.role === 'doctor' || user?.role === 'admin') && !viewingPrescription && !isAddingPrescription && !editingPrescription && (
                <Button
                  onClick={() => setIsAddingPrescription(true)}
                  leftIcon={<Plus className="h-4 w-4" />}
                >
                  New Prescription
                </Button>
              )}
            </div>

            {renderContent()}

            {/* Delete Confirmation Modal */}
            {prescriptionToDelete && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Delete Prescription
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Are you sure you want to delete this prescription? This action cannot be undone.
                  </p>
                  <div className="flex justify-end space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => setPrescriptionToDelete(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="danger"
                      onClick={handleDeletePrescription}
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

export default PrescriptionsPage;