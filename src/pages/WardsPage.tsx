import React, { useState } from 'react';
import { Building, Plus, Search, Filter, Edit2, BedDouble, Users, Activity, AlertTriangle, Trash2 } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Button from '../components/ui/Button';
import AddWardForm from '../components/wards/AddWardForm';
import EditWardForm from '../components/wards/EditWardForm';
import { useAuth } from '../context/AuthContext';
import { wards, admittances } from '../utils/mockData';
import type { Ward } from '../types';

const WardsPage: React.FC = () => {
  const { user } = useAuth();
  const canManageWards = user?.role === 'admin' || user?.role === 'doctor';
  const [isAddingWard, setIsAddingWard] = useState(false);
  const [editingWard, setEditingWard] = useState<Ward | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [wardToDelete, setWardToDelete] = useState<Ward | null>(null);

  const handleAddWard = (wardData: Omit<Ward, 'id'>) => {
    // In a real app, this would make an API call
    const newWard: Ward = {
      id: `ward${wards.length + 1}`,
      ...wardData
    };
    wards.push(newWard);
    setIsAddingWard(false);
  };

  const handleUpdateWard = (updatedWard: Ward) => {
    // In a real app, this would make an API call
    const wardIndex = wards.findIndex(w => w.id === updatedWard.id);
    if (wardIndex !== -1) {
      wards[wardIndex] = updatedWard;
    }
    setEditingWard(null);
  };

  const handleDeleteWard = () => {
    if (!wardToDelete) return;
    
    // Check if ward has current admittances
    const wardAdmittances = admittances.filter(a => a.wardId === wardToDelete.id && a.status === 'admitted');
    if (wardAdmittances.length > 0) {
      alert(`Cannot delete ward "${wardToDelete.name}" because it has ${wardAdmittances.length} current patient(s) admitted.`);
      setWardToDelete(null);
      return;
    }
    
    // In a real app, this would make an API call
    const wardIndex = wards.findIndex(w => w.id === wardToDelete.id);
    if (wardIndex !== -1) {
      wards.splice(wardIndex, 1);
    }
    setWardToDelete(null);
  };

  const getOccupancyPercentage = (totalBeds: number, availableBeds: number) => {
    const occupiedBeds = totalBeds - availableBeds;
    return Math.round((occupiedBeds / totalBeds) * 100);
  };

  const getOccupancyColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600 bg-red-100';
    if (percentage >= 75) return 'text-amber-600 bg-amber-100';
    return 'text-green-600 bg-green-100';
  };

  const filteredWards = wards.filter(ward => 
    ward.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ward.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate dashboard metrics
  const totalBeds = wards.reduce((sum, ward) => sum + ward.totalBeds, 0);
  const totalAvailableBeds = wards.reduce((sum, ward) => sum + ward.availableBeds, 0);
  const totalOccupiedBeds = totalBeds - totalAvailableBeds;
  const overallOccupancyRate = totalBeds > 0 ? Math.round((totalOccupiedBeds / totalBeds) * 100) : 0;
  const criticalWards = wards.filter(ward => 
    getOccupancyPercentage(ward.totalBeds, ward.availableBeds) >= 90
  ).length;

  const renderContent = () => {
    if (isAddingWard) {
      return (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Add New Ward</h2>
          <AddWardForm
            onSave={handleAddWard}
            onCancel={() => setIsAddingWard(false)}
          />
        </div>
      );
    }

    if (editingWard) {
      return (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Edit Ward</h2>
          <EditWardForm
            ward={editingWard}
            onSave={handleUpdateWard}
            onCancel={() => setEditingWard(null)}
          />
        </div>
      );
    }

    return (
      <>
        {/* Dashboard Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BedDouble className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Beds</p>
                <p className="text-2xl font-bold text-gray-900">{totalBeds}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available Beds</p>
                <p className="text-2xl font-bold text-gray-900">{totalAvailableBeds}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Activity className="h-6 w-6 text-amber-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                <p className="text-2xl font-bold text-gray-900">{overallOccupancyRate}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Critical Capacity</p>
                <p className="text-2xl font-bold text-gray-900">{criticalWards} wards</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="search"
              placeholder="Search wards..."
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWards.map((ward) => {
            const occupancyPercentage = getOccupancyPercentage(ward.totalBeds, ward.availableBeds);
            const occupancyColorClass = getOccupancyColor(occupancyPercentage);
            const wardAdmittances = admittances.filter(a => a.wardId === ward.id && a.status === 'admitted');

            return (
              <div key={ward.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{ward.name}</h2>
                      <p className="mt-1 text-sm text-gray-500 capitalize">{ward.type} Ward • Floor {ward.floorNumber}</p>
                    </div>
                    {canManageWards && (
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<Edit2 className="h-4 w-4" />}
                          onClick={() => setEditingWard(ward)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:bg-red-50"
                          leftIcon={<Trash2 className="h-4 w-4" />}
                          onClick={() => setWardToDelete(ward)}
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <BedDouble className="h-5 w-5 text-blue-600" />
                        <span className="ml-2 text-sm font-medium text-gray-700">Capacity</span>
                      </div>
                      <div className="mt-2">
                        <span className="text-2xl font-bold text-gray-900">{ward.totalBeds}</span>
                        <span className="ml-2 text-sm text-gray-500">beds</span>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <Users className="h-5 w-5 text-blue-600" />
                        <span className="ml-2 text-sm font-medium text-gray-700">Occupancy</span>
                      </div>
                      <div className="mt-2">
                        <span className="text-2xl font-bold text-gray-900">
                          {ward.totalBeds - ward.availableBeds}
                        </span>
                        <span className="ml-2 text-sm text-gray-500">patients</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Bed Availability</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${occupancyColorClass}`}>
                        {occupancyPercentage}% Occupied
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          occupancyPercentage >= 90 ? 'bg-red-500' :
                          occupancyPercentage >= 75 ? 'bg-amber-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${occupancyPercentage}%` }}
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      {ward.availableBeds} beds available out of {ward.totalBeds}
                    </p>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Current Admittances</h3>
                    <div className="space-y-2">
                      {wardAdmittances.length > 0 ? (
                        wardAdmittances.slice(0, 3).map((admittance) => (
                          <div key={admittance.id} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Bed {admittance.bedNumber}</span>
                            <span className="text-gray-900 font-medium">
                              Since {new Date(admittance.admissionDate).toLocaleDateString()}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No current admittances</p>
                      )}
                      {wardAdmittances.length > 3 && (
                        <p className="text-sm text-gray-500">
                          +{wardAdmittances.length - 3} more patients
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <Building className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">Hospital Wards</h1>
              </div>
              {canManageWards && (
                <Button 
                  leftIcon={<Plus className="h-4 w-4" />}
                  onClick={() => setIsAddingWard(true)}
                >
                  Add New Ward
                </Button>
              )}
            </div>

            {renderContent()}

            {/* Delete Confirmation Modal */}
            {wardToDelete && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Delete Ward
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Are you sure you want to delete "{wardToDelete.name}"? This action cannot be undone.
                  </p>
                  <div className="flex justify-end space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => setWardToDelete(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="danger"
                      onClick={handleDeleteWard}
                    >
                      Delete Ward
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

export default WardsPage;