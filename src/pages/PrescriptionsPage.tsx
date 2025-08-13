import React, { useState } from 'react';
import { Pill, Plus, Search, Filter, Edit2, Eye, Trash2, User, Calendar } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Button from '../components/ui/Button';
import AddPrescriptionForm from '../components/prescriptions/AddPrescriptionForm';
import EditPrescriptionForm from '../components/prescriptions/EditPrescriptionForm';
import ViewPrescription from '../components/prescriptions/ViewPrescription';
import { useAuth } from '../context/AuthContext';
import { prescriptions, orderLines, patients, doctors, medicines } from '../utils/mockData';
import type { Prescription, OrderLine } from '../types';

const PrescriptionsPage: React.FC = () => {
  const { user } = useAuth();
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

  // Filter prescriptions based on user role
  const filteredPrescriptions = prescriptions.filter(prescription => {
    const patient = patients.find(p => p.id === prescription.patientId);
    const doctor = doctors.find(d => d.id === prescription.doctorId);
    
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
    const searchString = `${patient?.firstName} ${patient?.lastName} ${doctor?.firstName} ${doctor?.lastName}`.toLowerCase();
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

  const handleAddPrescription = (newPrescription: Partial<Prescription>) => {
    const prescription: Prescription = {
      id: `presc${Date.now()}`,
      createdBy: user?.id || '',
      ...newPrescription as Prescription
    };
    prescriptions.push(prescription);
    setIsAddingPrescription(false);
  };

  const handleUpdatePrescription = (updatedPrescription: Prescription) => {
    const prescriptionIndex = prescriptions.findIndex(p => p.id === updatedPrescription.id);
    if (prescriptionIndex !== -1) {
      prescriptions[prescriptionIndex] = updatedPrescription;
    }
    setEditingPrescription(null);
  };

  const handleDeletePrescription = () => {
    if (!prescriptionToDelete) return;
    
    const prescriptionIndex = prescriptions.findIndex(p => p.id === prescriptionToDelete.id);
    if (prescriptionIndex !== -1) {
      prescriptions.splice(prescriptionIndex, 1);
      
      // Also remove associated order lines
      const orderLinesToRemove = orderLines.filter(ol => ol.prescriptionId === prescriptionToDelete.id);
      orderLinesToRemove.forEach(ol => {
        const orderIndex = orderLines.findIndex(o => o.id === ol.id);
        if (orderIndex !== -1) {
          orderLines.splice(orderIndex, 1);
        }
      });
    }
    setPrescriptionToDelete(null);
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
              placeholder="Search prescriptions..."
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
                        Dr. {doctor.firstName} {doctor.lastName}
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
                    const patient = patients.find(p => p.id === prescription.patientId);
                    const doctor = doctors.find(d => d.id === prescription.doctorId);
                    const prescriptionOrderLines = orderLines.filter(ol => ol.prescriptionId === prescription.id);
                    
                    return (
                      <tr key={prescription.id} className="hover:bg-gray-50">
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
                                ID: {patient?.patientId}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            Dr. {doctor?.firstName} {doctor?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {doctor?.specialization}
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
                            {prescriptionOrderLines.length} medication(s)
                          </div>
                          <div className="text-sm text-gray-500">
                            {prescriptionOrderLines.slice(0, 2).map(ol => {
                              const medicine = medicines.find(m => m.id === ol.medicineId);
                              return medicine?.name;
                            }).filter(Boolean).join(', ')}
                            {prescriptionOrderLines.length > 2 && '...'}
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