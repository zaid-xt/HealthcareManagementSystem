import React, { useState } from 'react';
import { FlaskRound as Flask, Plus, Search, Filter, Edit2, Eye, X, Trash2 } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Button from '../components/ui/Button';
import AddLabResultForm from '../components/labs/AddLabResultForm';
import EditLabResultForm from '../components/labs/EditLabResultForm';
import { useAuth } from '../context/AuthContext';
import { labs, patients, doctors } from '../utils/mockData';
import type { Lab } from '../types';

const LabResultsPage: React.FC = () => {
  const { user } = useAuth();
  const [isAddingLab, setIsAddingLab] = useState(false);
  const [editingLab, setEditingLab] = useState<Lab | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [labToDelete, setLabToDelete] = useState<Lab | null>(null);

  const handleAddLab = (newLab: Partial<Lab>) => {
    // In a real app, this would make an API call
    const lab: Lab = {
      id: `lab${Date.now()}`,
      ...newLab as Lab
    };
    labs.push(lab);
    setIsAddingLab(false);
  };

  const handleUpdateLab = (updatedLab: Lab) => {
    // In a real app, this would make an API call
    const labIndex = labs.findIndex(l => l.id === updatedLab.id);
    if (labIndex !== -1) {
      labs[labIndex] = updatedLab;
    }
    setEditingLab(null);
  };

  const handleDeleteLab = () => {
    if (!labToDelete) return;
    
    // In a real app, this would make an API call
    const labIndex = labs.findIndex(l => l.id === labToDelete.id);
    if (labIndex !== -1) {
      labs.splice(labIndex, 1);
    }
    setLabToDelete(null);
  };

  const filteredLabs = labs.filter(lab => {
    const patient = patients.find(p => p.id === lab.patientId);
    const searchString = `${patient?.firstName} ${patient?.lastName} ${lab.testType}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  const getStatusColor = (status: Lab['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
                <Flask className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">Lab Results</h1>
              </div>
              {user?.role === 'doctor' && (
                <Button
                  onClick={() => setIsAddingLab(true)}
                  leftIcon={<Plus className="h-4 w-4" />}
                >
                  New Lab Test
                </Button>
              )}
            </div>

            {isAddingLab ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Add New Lab Test</h2>
                <AddLabResultForm
                  onSave={handleAddLab}
                  onCancel={() => setIsAddingLab(false)}
                />
              </div>
            ) : editingLab ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Edit Lab Result</h2>
                <EditLabResultForm
                  lab={editingLab}
                  onSave={handleUpdateLab}
                  onCancel={() => setEditingLab(null)}
                />
              </div>
            ) : (
              <>
                <div className="mb-6 flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="search"
                      placeholder="Search lab results..."
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
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Patient
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Test Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Doctor
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
                      {filteredLabs.map((lab) => {
                        const patient = patients.find(p => p.id === lab.patientId);
                        const doctor = doctors.find(d => d.id === lab.doctorId);
                        
                        return (
                          <tr key={lab.id} className="hover:bg-gray-50">
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
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">{lab.testType}</div>
                              <div className="text-sm text-gray-500">
                                Date: {new Date(lab.date).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">Dr. {doctor?.firstName} {doctor?.lastName}</div>
                              <div className="text-sm text-gray-500">{doctor?.specialization}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(lab.status)}`}>
                                {lab.status.charAt(0).toUpperCase() + lab.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Button
                                variant="outline"
                                size="sm"
                                className="mr-2"
                                leftIcon={<Eye className="h-4 w-4" />}
                                onClick={() => window.alert('View functionality would go here')}
                              >
                                View
                              </Button>
                              {user?.role === 'doctor' && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="mr-2"
                                    leftIcon={<Edit2 className="h-4 w-4" />}
                                    onClick={() => setEditingLab(lab)}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:bg-red-50"
                                    leftIcon={<Trash2 className="h-4 w-4" />}
                                    onClick={() => setLabToDelete(lab)}
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
              </>
            )}

            {/* Delete Confirmation Modal */}
            {labToDelete && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Delete Lab Result
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Are you sure you want to delete this lab result? This action cannot be undone.
                  </p>
                  <div className="flex justify-end space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => setLabToDelete(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="danger"
                      onClick={handleDeleteLab}
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

export default LabResultsPage;