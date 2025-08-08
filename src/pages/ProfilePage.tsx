import React, { useState } from 'react';
import { User, Save, X, Stethoscope } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { doctors, users } from '../utils/mockData';

const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const doctor = doctors.find(d => d.userId === user?.id);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    firstName: doctor?.firstName || '',
    lastName: doctor?.lastName || '',
    specialization: doctor?.specialization || '',
    department: doctor?.department || '',
    contactNumber: doctor?.contactNumber || '',
    email: user?.email || '',
    doctorId: user?.doctorId || doctor?.licenseNumber || '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const doctorIndex = doctors.findIndex(d => d.userId === user?.id);
      if (doctorIndex !== -1) {
        doctors[doctorIndex] = {
          ...doctors[doctorIndex],
          firstName: formData.firstName,
          lastName: formData.lastName,
          specialization: formData.specialization,
          department: formData.department,
          contactNumber: formData.contactNumber,
          email: formData.email
        };
        
        if (formData.doctorId !== doctors[doctorIndex].licenseNumber) {
          doctors[doctorIndex].licenseNumber = formData.doctorId;
        }
      }

     if (user) {
  await updateProfile({
    name: `${formData.firstName} ${formData.lastName}`,
  });
}

      const userIndex = users.findIndex(u => u.id === user?.id);
      if (userIndex !== -1) {
        users[userIndex] = {
          ...users[userIndex],
          name: formData.name,
          email: formData.email,
          doctorId: formData.doctorId,
          specialization: formData.specialization
        };
      }

      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                {user?.role === 'doctor' ? (
                  <Stethoscope className="h-8 w-8 text-blue-600" />
                ) : (
                  <User className="h-8 w-8 text-blue-600" />
                )}
                <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              </div>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <Input
                          label="Full Name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          required
                        />
                      </div>
                      
                      {user?.role === 'doctor' && (
                        <>
                          <Input
                            label="First Name"
                            value={formData.firstName}
                            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                            required
                          />
                          
                          <Input
                            label="Last Name"
                            value={formData.lastName}
                            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                            required
                          />
                        </>
                      )}
                      <Input
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                      
                      <Input
                        label="Contact Number"
                        value={formData.contactNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, contactNumber: e.target.value }))}
                      />
                      
                      {user?.role === 'doctor' && (
                        <>
                          <Input
                            label="Doctor ID"
                            value={formData.doctorId}
                            onChange={(e) => setFormData(prev => ({ ...prev, doctorId: e.target.value }))}
                            required
                          />
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Specialization
                            </label>
                            <select
                              value={formData.specialization}
                              onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              required
                            >
                              <option value="">Select specialization</option>
                              <option value="Cardiology">Cardiology</option>
                              <option value="Neurology">Neurology</option>
                              <option value="Orthopedics">Orthopedics</option>
                              <option value="Pediatrics">Pediatrics</option>
                              <option value="Dermatology">Dermatology</option>
                              <option value="Psychiatry">Psychiatry</option>
                              <option value="Radiology">Radiology</option>
                              <option value="Anesthesiology">Anesthesiology</option>
                              <option value="Emergency Medicine">Emergency Medicine</option>
                              <option value="Internal Medicine">Internal Medicine</option>
                              <option value="Surgery">Surgery</option>
                              <option value="Obstetrics and Gynecology">Obstetrics and Gynecology</option>
                              <option value="Ophthalmology">Ophthalmology</option>
                              <option value="Pathology">Pathology</option>
                              <option value="Family Medicine">Family Medicine</option>
                            </select>
                          </div>
                          
                          <Input
                            label="Department"
                            value={formData.department}
                            onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                          />
                        </>
                      )}
                    </div>

                    <div className="flex justify-end space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        leftIcon={<X className="h-4 w-4" />}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        isLoading={isSaving}
                        leftIcon={<Save className="h-4 w-4" />}
                      >
                        Save Changes
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center">
                      <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <span className="text-2xl font-medium">
                          {(formData.name || '')
                            .split(' ')
                            .map(n => n[0] || '')
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)}
                        </span>
                      </div>
                      <div className="ml-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                          {user?.role === 'doctor' ? 'Dr. ' : ''}{formData.name}
                        </h2>
                        <p className="text-gray-500 capitalize">{user?.role}</p>
                        {user?.role === 'doctor' && formData.specialization && (
                          <p className="text-sm text-blue-600">{formData.specialization}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                        <p className="mt-1 text-sm text-gray-900">{formData.name}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Email</h3>
                        <p className="mt-1 text-sm text-gray-900">{formData.email}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Contact Number</h3>
                        <p className="mt-1 text-sm text-gray-900">{formData.contactNumber || 'Not provided'}</p>
                      </div>
                      
                      {user?.role === 'doctor' && (
                        <>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">First Name</h3>
                            <p className="mt-1 text-sm text-gray-900">{formData.firstName}</p>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Last Name</h3>
                            <p className="mt-1 text-sm text-gray-900">{formData.lastName}</p>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Doctor ID</h3>
                            <p className="mt-1 text-sm text-gray-900">{formData.doctorId}</p>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Specialization</h3>
                            <p className="mt-1 text-sm text-gray-900">{formData.specialization}</p>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Department</h3>
                            <p className="mt-1 text-sm text-gray-900">{formData.department || formData.specialization}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;
