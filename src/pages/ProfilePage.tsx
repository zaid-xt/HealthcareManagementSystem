import React, { useState } from 'react';
import { User, Save, X, Stethoscope, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import ConfirmationModal from '../components/ui/ConfirmationModal'

const ProfilePage: React.FC = () => {
  const { user, updateProfile, deleteProfile, logout } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
  name: user?.name || '',
  email: user?.email || '',
  doctorId: user?.doctorId || '',
  idNumber: user?.idNumber || '', 
  contactNumber: user?.contactNumber || '' 
});


  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (user) {
        await updateProfile({
          ...user,
          name: formData.name,
          email: formData.email,
          doctorId: user.role === 'doctor' ? formData.doctorId : null,
          idNumber: formData.idNumber, 
          contactNumber: formData.contactNumber
        });
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProfile = async () => {
    try {
      await deleteProfile();
      logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to delete profile:', error);
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
                <div className="flex gap-2">
                  <Button onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => setShowDeleteModal(true)}
                    leftIcon={<Trash2 className="h-4 w-4" />}
                  >
                    Delete Profile
                  </Button>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                      <div className="md:col-span-1">
                        <Input
                          label="Full Name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          required
                        />
                      </div>
                      
                      {user?.role === 'doctor' && (
                        <Input
                          label="Doctor ID"
                          value={formData.doctorId}
                          onChange={(e) => setFormData(prev => ({ ...prev, doctorId: e.target.value }))}
                          required
                        />
                      )}
                      
                      <Input
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />

                      <Input
                        label="ID Number"
                        value={formData.idNumber}
                        onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        setFormData(prev => ({ ...prev, idNumber: value }));
                        }}
                        maxLength={13}
                        placeholder="13 digit number"
                        required
                      />
      
                      <Input
                        label="Contact Number"
                        value={formData.contactNumber}
                        onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        setFormData(prev => ({ ...prev, contactNumber: value }));
                     }}
                        maxLength={10}
                        placeholder="10 digit number"
                        required
                      />
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
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                        <p className="mt-1 text-sm text-gray-900">{formData.name}</p>
                      </div>
                      
                      {user?.role === 'doctor' && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Doctor ID</h3>
                          <p className="mt-1 text-sm text-gray-900">{formData.doctorId}</p>
                        </div>
                      )}
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Email</h3>
                        <p className="mt-1 text-sm text-gray-900">{formData.email}</p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500">ID Number</h3>
                        <p className="mt-1 text-sm text-gray-900">{formData.idNumber}</p>
                      </div>
      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Contact Number</h3>
                        <p className="mt-1 text-sm text-gray-900">{formData.contactNumber}</p>
                    </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <ConfirmationModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={handleDeleteProfile}
            title="Delete Profile"
            message="Are you sure you want to permanently delete your profile? This action cannot be undone."
            confirmText="Delete Profile"
            confirmVariant="danger"
          />
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;