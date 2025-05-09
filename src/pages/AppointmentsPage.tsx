import React, { useState } from 'react';
import { Plus, Calendar, Clock, User, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { appointments, doctors, patients } from '../utils/mockData';
import type { Appointment } from '../types';

const AppointmentsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Filter appointments based on user role
  const filteredAppointments = appointments.filter(appointment => {
    if (user?.role === 'patient') {
      return appointment.patientId === user.id;
    } else if (user?.role === 'doctor') {
      return appointment.doctorId === user.id;
    }
    return true; // Admin sees all appointments
  });

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no-show':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-900">Appointments</h1>
                {user?.role === 'patient' && (
                  <Button
                    onClick={() => navigate('/appointments/new')}
                    leftIcon={<Plus className="h-4 w-4" />}
                  >
                    New Appointment
                  </Button>
                )}
              </div>
              
              <div className="mt-8">
                {filteredAppointments.length > 0 ? (
                  <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                      {filteredAppointments.map(appointment => {
                        const doctor = doctors.find(d => d.id === appointment.doctorId);
                        const patient = patients.find(p => p.id === appointment.patientId);
                        
                        return (
                          <li key={appointment.id}>
                            <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0">
                                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                      <User className="h-6 w-6" />
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {user?.role === 'patient' 
                                        ? `Dr. ${doctor?.firstName} ${doctor?.lastName}`
                                        : `${patient?.firstName} ${patient?.lastName}`
                                      }
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1)} Appointment
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                  </span>
                                  <div className="text-sm text-gray-900">
                                    <div className="flex items-center">
                                      <Calendar className="h-4 w-4 mr-1" />
                                      {new Date(appointment.date).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center mt-1">
                                      <Clock className="h-4 w-4 mr-1" />
                                      {appointment.startTime} - {appointment.endTime}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              {appointment.notes && (
                                <div className="mt-2 flex items-center text-sm text-gray-500">
                                  <FileText className="h-4 w-4 mr-1" />
                                  {appointment.notes}
                                </div>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {user?.role === 'patient' 
                        ? 'Get started by creating a new appointment.'
                        : 'No appointments scheduled yet.'}
                    </p>
                    {user?.role === 'patient' && (
                      <div className="mt-6">
                        <Button
                          onClick={() => navigate('/appointments/new')}
                          leftIcon={<Plus className="h-4 w-4" />}
                        >
                          New Appointment
                        </Button>
                      </div>
                    )}
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

export default AppointmentsPage;