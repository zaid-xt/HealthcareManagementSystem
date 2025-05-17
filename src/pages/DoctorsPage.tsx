import React, { useState } from 'react';
import { User, Search, Filter, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Button from '../components/ui/Button';
import AddDoctorForm from '../components/doctors/AddDoctorForm';
import { doctors, users } from '../utils/mockData';
import type { Doctor } from '../types';

const DoctorsPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [isAddingDoctor, setIsAddingDoctor] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);

  const handleAddDoctor = (doctorData: Omit<Doctor, 'id' | 'userId'>) => {
    // In a real app, this would make an API call
    const newDoctor: Doctor = {
      id: `doctor${doctors.length + 1}`,
      userId: `user${users.length + 1}`,
      ...doctorData
    };

    // Create a new user account for the doctor
    const newUser = {
      id: newDoctor.userId,
      email: doctorData.email,
      name: `Dr. ${doctorData.firstName} ${doctorData.lastName}`,
      role: 'doctor' as const
    };

    doctors.push(newDoctor);
    users.push(newUser);
    setIsAddingDoctor(false);
  };

  const handleDeleteDoctor = () => {
    if (!doctorToDelete) return;

    // In a real app, this would make an API call
    const doctorIndex = doctors.findIndex(d => d.id === doctorToDelete.id);
    if (doctorIndex !== -1) {
      // Remove the doctor
      doctors.splice(doctorIndex, 1);

      // Remove the associated user account
      const userIndex = users.findIndex(u => u.id === doctorToDelete.userId);
      if (userIndex !== -1) {
        users.splice(userIndex, 1);
      }
    }
    setDoctorToDelete(null);
  };

  const filteredDoctors = doctors.filter(doctor => {
    const searchString = `${doctor.firstName} ${doctor.lastName} ${doctor.specialization}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="max-w-7xl mx-auto text-center py-12">
              <h2 className="text-2xl font-semibold text-gray-900">Access Restricted</h2>
              <p className="mt-2 text-gray-600">Only administrators can view this page.</p>
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
                <h1 className="text-3xl font-bold text-gray-900">Doctors</h1>
              </div>
              <Button
                onClick={() => setIsAddingDoctor(true)}
                leftIcon={<User className="h-4 w-4" />}
              >
                Add New Doctor
              </Button>
            </div>

            {isAddingDoctor ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Add New Doctor</h2>
                <AddDoctorForm
                  onSave={handleAddDoctor}
                  onCancel={() => setIsAddingDoctor(false)}
                />
              </div>
            ) : (
              <>
                <div className="mb-6 flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="search"
                      placeholder="Search doctors..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      leftIcon={<Filter className="h-4 w-4" />}
                    >
                      Filter
                    </Button>
                  </div>
                </div>

                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Doctor
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Specialization
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contact
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Login Details
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredDoctors.map((doctor) => (
                          <tr key={doctor.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                  <span className="font-medium text-sm">
                                    {doctor.firstName[0]}{doctor.lastName[0]}
                                  </span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    Dr. {doctor.firstName} {doctor.lastName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    License: {doctor.licenseNumber}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{doctor.specialization}</div>
                              <div className="text-sm text-gray-500">{doctor.department}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{doctor.contactNumber}</div>
                              <div className="text-sm text-gray-500">{doctor.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">User ID: {doctor.userId}</div>
                              <div className="text-sm text-gray-500">Active Account</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Button
                                variant="outline"
                                size="sm"
                                className="mr-2"
                              >
                                View Schedule
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mr-2"
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:bg-red-50"
                                leftIcon={<Trash2 className="h-4 w-4" />}
                                onClick={() => setDoctorToDelete(doctor)}
                              >
                                Delete
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 flex justify-between sm:hidden">
                        <Button variant="outline" size="sm">Previous</Button>
                        <Button variant="outline" size="sm">Next</Button>
                      </div>
                      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-gray-700">
                            Showing <span className="font-medium">1</span> to{' '}
                            <span className="font-medium">{filteredDoctors.length}</span> of{' '}
                            <span className="font-medium">{filteredDoctors.length}</span> results
                          </p>
                        </div>
                        <div>
                          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-l-md"
                            >
                              Previous
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-r-md"
                            >
                              Next
                            </Button>
                          </nav>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Delete Confirmation Modal */}
            {doctorToDelete && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Delete Doctor
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Are you sure you want to delete Dr. {doctorToDelete.firstName} {doctorToDelete.lastName}? This action cannot be undone.
                  </p>
                  <div className="flex justify-end space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => setDoctorToDelete(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="danger"
                      onClick={handleDeleteDoctor}
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

export default DoctorsPage;