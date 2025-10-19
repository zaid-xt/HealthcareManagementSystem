import React, { useState, useEffect } from 'react';
import { FlaskRound as Flask, Plus, Search, Filter, Edit2, Eye, Trash2 } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Button from '../components/ui/Button';
import AddLabResultForm from '../components/labs/AddLabResultForm';
import EditLabResultForm from '../components/labs/EditLabResultForm';
import { useAuth } from '../context/AuthContext';
import { labResultsApi, type LabResultResponse } from '../api/labResultsApi';
import type { Lab } from '../types';

const LabResultsPage: React.FC = () => {
  const { user } = useAuth();
  const [isAddingLab, setIsAddingLab] = useState(false);
  const [editingLab, setEditingLab] = useState<Lab | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [labToDelete, setLabToDelete] = useState<LabResultResponse | null>(null);
  const [labs, setLabs] = useState<LabResultResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load lab results on component mount
  useEffect(() => {
    loadLabResults();
  }, []);

  // Auto-clear success messages after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const loadLabResults = async () => {
    try {
      setLoading(true);
      setError(null);
      const results = await labResultsApi.getAll();
      setLabs(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load lab results');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLab = async (newLab: Partial<Lab>) => {
    try {
      setOperationLoading(true);
      setError(null);
      const createdLab = await labResultsApi.create(newLab);
      setLabs(prev => [...prev, createdLab]);
      setIsAddingLab(false);
      setSuccessMessage('Lab result created successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create lab result');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleUpdateLab = async (updatedLab: Lab) => {
    try {
      setOperationLoading(true);
      setError(null);
      const updated = await labResultsApi.update(updatedLab.id, updatedLab);
      setLabs(prev => prev.map(lab => lab.id === updatedLab.id ? updated : lab));
      setEditingLab(null);
      setSuccessMessage('Lab result updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update lab result');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDeleteLab = async () => {
    if (!labToDelete) return;
    
    try {
      setOperationLoading(true);
      setError(null);
      await labResultsApi.delete(labToDelete.id);
      setLabs(prev => prev.filter(lab => lab.id !== labToDelete.id));
      setLabToDelete(null);
      setSuccessMessage('Lab result deleted successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete lab result');
    } finally {
      setOperationLoading(false);
    }
  };

  const filteredLabs = labs.filter(lab => {
    const searchString = `${lab.patientName || ''} ${lab.testType}`.toLowerCase();
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
                  loading={operationLoading}
                />
              </div>
            ) : editingLab ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Edit Lab Result</h2>
                <EditLabResultForm
                  lab={editingLab}
                  onSave={handleUpdateLab}
                  onCancel={() => setEditingLab(null)}
                  loading={operationLoading}
                />
              </div>
            ) : (
              <>
                {/* Success Message */}
                {successMessage && (
                  <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex">
                      <div className="text-green-800">
                        {successMessage}
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex">
                      <div className="text-red-800">
                        {error}
                      </div>
                      <button
                        onClick={() => setError(null)}
                        className="ml-auto text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}

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
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-3 text-gray-600">Loading lab results...</span>
                    </div>
                  ) : filteredLabs.length === 0 ? (
                    <div className="text-center py-12">
                      <Flask className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No lab results</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {searchTerm ? 'No results match your search.' : 'Get started by creating a new lab test.'}
                      </p>
                    </div>
                  ) : (
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
                        const patientName = lab.patientName || 'Unknown Patient';
                        const doctorName = lab.doctorName || 'Unknown Doctor';
                        const patientInitials = patientName.split(' ').map(n => n[0]).join('').toUpperCase();
                        
                        return (
                          <tr key={lab.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                  <span className="font-medium text-sm">
                                    {patientInitials}
                                  </span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {patientName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    ID: {lab.patientId}
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
                              <div className="text-sm text-gray-900">Dr. {doctorName}</div>
                              <div className="text-sm text-gray-500">Doctor</div>
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
                  )}
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
                    Are you sure you want to delete this lab result for {labToDelete.patientName || 'this patient'}? This action cannot be undone.
                  </p>
                  <div className="flex justify-end space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => setLabToDelete(null)}
                      disabled={operationLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="danger"
                      onClick={handleDeleteLab}
                      disabled={operationLoading}
                    >
                      {operationLoading ? 'Deleting...' : 'Delete'}
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