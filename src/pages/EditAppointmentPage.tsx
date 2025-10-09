import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import AppointmentForm from '../components/appointments/AppointmentForm';
import { useAuth } from '../context/AuthContext';
import { fetchAppointment, updateAppointment } from '../api/appointmentsApi';
import type { Appointment } from '../types';

const EditAppointmentPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [appointment, setAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    const loadAppointment = async () => {
      if (!id) return;
      
      try {
        const foundAppointment = await fetchAppointment(id);
        setAppointment(foundAppointment);
      } catch (error) {
        console.error('Error loading appointment:', error);
        navigate('/appointments', { 
          state: { message: 'Appointment not found' } 
        });
      }
    };

    loadAppointment();
  }, [id, navigate]);

  const handleSubmit = async (appointmentData: Partial<Appointment>) => {
    if (!id) return;
    
    setIsLoading(true);
    
    try {
      await updateAppointment(id, appointmentData);
      
      navigate('/appointments', { 
        state: { message: 'Appointment updated successfully!' } 
      });
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Failed to update appointment');
    } finally {
      setIsLoading(false);
    }
  };


  if (!appointment) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            <div className="py-6">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading appointment...</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto">
          <div className="py-6">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
              {/* Header */}
              <div className="flex items-center mb-6">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">Edit Appointment</h1>
                  <p className="text-gray-600">Update your appointment details</p>
                </div>
              </div>
              
              {/* Appointment Form */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <AppointmentForm 
                  onSubmit={handleSubmit}
                  isLoading={isLoading}
                  initialData={appointment}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EditAppointmentPage;