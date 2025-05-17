import React, { useState } from 'react';
import { User, Save, X } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { doctors } from '../utils/mockData';

const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const doctor = doctors.find(d => d.userId === user?.id);
  
  const [formData, setFormData] = useState({
    firstName: doctor?.firstName || '',
    lastName: doctor?.lastName || '',
    specialization: doctor?.specialization || '',
    department: doctor?.department || '',
    contactNumber: doctor?.contactNumber || '',
    email: user?.email || '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // In a real app, this would make an API call
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
      }

      // Update user name in auth context
      if (user) {
        await updateProfile({
          ...user,
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email
        });
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
                <User className="h-8 w-8 text-blue-600" />
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
                        required
                      />
                      
                      {user?.role === 'doctor' && (
                        <>
                          <Input
                            label="Specialization"
                            value={formData.specialization}
                            onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
                            required
                          />
                          
                          <Input
                            label="Department"
                            value={formData.department}
                            onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                            required
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
                          {formData.firstName[0]}{formData.lastName[0]}
                        </span>
                      </div>
                      <div className="ml-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                          {user?.role === 'doctor' ? 'Dr. ' : ''}{formData.firstName} {formData.lastName}
                        </h2>
                        <p className="text-gray-500 capitalize">{user?.role}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Email</h3>
                        <p className="mt-1 text-sm text-gray-900">{formData.email}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Contact Number</h3>
                        <p className="mt-1 text-sm text-gray-900">{formData.contactNumber}</p>
                      </div>
                      
                      {user?.role === 'doctor' && (
                        <>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Specialization</h3>
                            <p className="mt-1 text-sm text-gray-900">{formData.specialization}</p>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Department</h3>
                            <p className="mt-1 text-sm text-gray-900">{formData.department}</p>
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