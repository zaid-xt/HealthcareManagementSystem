import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import AppointmentForm from '../components/appointments/AppointmentForm';
import { useAuth } from '../context/AuthContext';
import { createAppointment } from '../api/appointmentsApi';
import type { Appointment } from '../types';

const NewAppointmentPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (appointmentData: Partial<Appointment>) => {
    setIsLoading(true);
    
    try {
      // Create new appointment with all required fields including createdBy
      const newAppointment: Partial<Appointment> = {
        id: `appt-${Date.now()}`, // Generate unique ID
        ...appointmentData,
        patientId: user?.id || '',
        status: 'scheduled',
        createdBy: user?.id || '' // Set createdBy to current user
      };

      await createAppointment(newAppointment);
      
      navigate('/appointments', { 
        state: { message: 'Appointment scheduled successfully!' } 
      });
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Failed to create appointment');
    } finally {
      setIsLoading(false);
    }
  };

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
                  <h1 className="text-2xl font-semibold text-gray-900">Book New Appointment</h1>
                  <p className="text-gray-600">Schedule a new appointment with your doctor</p>
                </div>
              </div>
              
              {/* Appointment Form */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <AppointmentForm 
                  onSubmit={handleSubmit}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default NewAppointmentPage;