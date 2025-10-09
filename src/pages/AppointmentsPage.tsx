import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Calendar as CalendarIcon, Clock, User, FileText, CheckCircle, MapPin, Stethoscope, Edit, Trash2, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { fetchAppointments, deleteAppointment, updateAppointment } from '../api/appointmentsApi';
import type { Appointment } from '../types';

const AppointmentsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, [user]);

  // Show success message when redirected from new appointment
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Add this debug effect
  useEffect(() => {
    console.log('🔍 DEBUG - User and Appointments:', {
      currentUser: user,
      allAppointments: appointments,
      userRole: user?.role,
      userId: user?.id,
      isDoctor: user?.role === 'doctor'
    });
  }, [user, appointments]);

  const loadAppointments = async () => {
    try {
      setIsLoading(true);
      const filters: any = {};
      
      if (user?.role === 'patient') {
        filters.patientId = user.id;
        console.log(`👤 Loading appointments for patient: ${user.id}`);
      } else if (user?.role === 'doctor') {
        filters.doctorId = user.id;
        console.log(`👨‍⚕️ Loading appointments for doctor: ${user.id}`);
      }
      // Admin sees all appointments (no filter)
      else if (user?.role === 'admin') {
        console.log(`👑 Admin loading all appointments`);
      }
      
      console.log('🔍 Fetching appointments with filters:', filters);
      const data = await fetchAppointments(filters);
      console.log('📅 Received appointments:', data);
      setAppointments(data);
    } catch (error) {
      console.error('Error loading appointments:', error);
      alert('Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await deleteAppointment(appointmentId);
        setAppointments(prev => prev.filter(appt => appt.id !== appointmentId));
        
        setSuccessMessage('Appointment deleted successfully');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
      } catch (error) {
        console.error('Error deleting appointment:', error);
        alert('Failed to delete appointment');
      }
    }
  };

  const handleEditAppointment = (appointmentId: string) => {
    navigate(`/appointments/edit/${appointmentId}`);
  };

  const handleStatusUpdate = async (appointmentId: string, newStatus: 'completed' | 'cancelled' | 'scheduled') => {
    try {
      const appointment = appointments.find(apt => apt.id === appointmentId);
      if (!appointment) return;

      console.log(`🔄 Updating appointment ${appointmentId} to ${newStatus}`, {
        currentDoctorId: user?.id,
        appointmentDoctorId: appointment.doctorId
      });

      const updatedAppointment = {
        ...appointment,
        status: newStatus,
        updatedAt: new Date().toISOString()
      };

      await updateAppointment(appointmentId, updatedAppointment);
      
      // Update local state
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId ? { ...apt, status: newStatus } : apt
        )
      );
      
      const statusMessage = newStatus === 'completed' 
        ? 'Appointment marked as completed' 
        : newStatus === 'cancelled'
        ? 'Appointment cancelled'
        : 'Appointment reopened';
      
      setSuccessMessage(statusMessage);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error('Error updating appointment status:', error);
      alert('Failed to update appointment status');
    }
  };

  const canModifyAppointment = (appointment: Appointment) => {
    const isAdmin = user?.role === 'admin';
    const isPatientOwner = user?.role === 'patient' && String(appointment.patientId) === String(user.id);
    const isDoctorOwner = user?.role === 'doctor' && String(appointment.doctorId) === String(user.id);
    
    const result = isAdmin || isPatientOwner || isDoctorOwner;
    
    console.log(`🔐 canModifyAppointment for appointment ${appointment.id}:`, {
      userRole: user?.role,
      userId: user?.id,
      appointmentPatientId: appointment.patientId,
      appointmentDoctorId: appointment.doctorId,
      isAdmin: isAdmin,
      isPatientOwner: isPatientOwner,
      isDoctorOwner: isDoctorOwner,
      finalResult: result
    });
    
    return result;
  };

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'no-show':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="h-3 w-3" />;
      case 'completed':
        return <CheckCircle className="h-3 w-3" />;
      case 'cancelled':
        return <FileText className="h-3 w-3" />;
      default:
        return <CalendarIcon className="h-3 w-3" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  // Sort appointments by date (most recent first)
  const sortedAppointments = [...appointments].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {/* Success Message */}
              {showSuccess && (
                <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center animate-fade-in">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-green-800 font-medium">{successMessage}</p>
                    <p className="text-green-600 text-sm mt-1">
                      {successMessage.includes('deleted') 
                        ? 'The appointment has been removed from your schedule.'
                        : 'The appointment status has been updated.'
                      }
                    </p>
                  </div>
                </div>
              )}

              {/* Updated Header Section - Matching MedicalRecordsPage style */}
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <Calendar className="h-8 w-8 text-blue-600" />
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
                    <p className="text-gray-600 mt-1">
                      {user?.role === 'patient' 
                        ? 'Your upcoming and past appointments'
                        : user?.role === 'doctor'
                        ? 'Your patient appointments'
                        : 'All appointments management'
                      }
                    </p>
                  </div>
                </div>
                {user?.role === 'patient' && (
                  <Button
                    onClick={() => navigate('/appointments/new')}
                    leftIcon={<Plus className="h-4 w-4" />}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    New Appointment
                  </Button>
                )}
              </div>
              
              {/* Show doctor info if logged in as doctor */}
              {user?.role === 'doctor' && (
                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-700">
                    You are logged in as Dr. {user.name}. Here you can manage your patient appointments.
                  </p>
                </div>
              )}
              
              {/* Stats Cards */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className="text-2xl font-semibold text-gray-900">
                    {sortedAppointments.filter(a => a.status === 'scheduled').length}
                  </div>
                  <div className="text-sm text-gray-600">Scheduled</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className="text-2xl font-semibold text-gray-900">
                    {sortedAppointments.filter(a => a.status === 'completed').length}
                  </div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className="text-2xl font-semibold text-gray-900">
                    {sortedAppointments.filter(a => a.status === 'cancelled').length}
                  </div>
                  <div className="text-sm text-gray-600">Cancelled</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className="text-2xl font-semibold text-gray-900">
                    {sortedAppointments.length}
                  </div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
              </div>
              
              <div className="mt-8">
                {sortedAppointments.length > 0 ? (
                  <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-900">
                        {user?.role === 'patient' 
                          ? 'Your Appointments' 
                          : user?.role === 'doctor'
                          ? 'Your Patient Appointments'
                          : 'All Appointments'
                        }
                      </h2>
                    </div>
                    <ul className="divide-y divide-gray-200">
                      {sortedAppointments.map(appointment => {
                        const canModify = canModifyAppointment(appointment);
                        const isDoctorOwner = user?.role === 'doctor' && String(appointment.doctorId) === String(user.id);
                        
                        return (
                          <li key={appointment.id} className="hover:bg-gray-50 transition-colors">
                            <div className="px-6 py-4">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-4 flex-1">
                                  <div className="flex-shrink-0">
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-blue-600 border border-blue-200">
                                      <User className="h-6 w-6" />
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2">
                                      <h3 className="text-lg font-medium text-gray-900">
                                        {user?.role === 'patient' 
                                          ? `Dr. ${appointment.doctorName || 'Unknown Doctor'}`
                                          : appointment.patientName || 'Unknown Patient'
                                        }
                                      </h3>
                                      <span className={`px-2 py-1 inline-flex items-center text-xs leading-4 font-medium rounded-full border ${getStatusColor(appointment.status)}`}>
                                        {getStatusIcon(appointment.status)}
                                        <span className="ml-1">
                                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                        </span>
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1 flex items-center">
                                      <Stethoscope className="h-4 w-4 mr-1" />
                                      {user?.role === 'patient' 
                                        ? appointment.doctorName || 'General Practitioner'
                                        : `Patient Appointment`
                                      }
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1 flex items-center">
                                      <MapPin className="h-4 w-4 mr-1" />
                                      {appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1)} Appointment
                                    </p>
                                    {/* Show who created the appointment for admin users */}
                                    {user?.role === 'admin' && appointment.createdByName && (
                                      <p className="text-sm text-gray-500 mt-1 flex items-center">
                                        <User className="h-4 w-4 mr-1" />
                                        Created by: {appointment.createdByName}
                                      </p>
                                    )}
                                    {appointment.notes && (
                                      <div className="mt-2 flex items-start text-sm text-gray-500">
                                        <FileText className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                                        <span>{appointment.notes}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-start space-x-4 flex-shrink-0">
                                  <div className="text-right">
                                    <div className="text-sm font-medium text-gray-900 flex items-center justify-end">
                                      <CalendarIcon className="h-4 w-4 mr-1" />
                                      {formatDate(appointment.date)}
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1 flex items-center justify-end">
                                      <Clock className="h-4 w-4 mr-1" />
                                      {appointment.startTime} - {appointment.endTime}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-2">
                                      Duration: 30 mins
                                    </div>
                                  </div>
                                  
                                  {/* Action Buttons */}
                                  {canModify && (
                                    <div className="flex flex-col space-y-2">
                                      {/* Status update buttons for doctors */}
                                      {isDoctorOwner && (
                                        <>
                                          {appointment.status === 'scheduled' && (
                                            <>
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                leftIcon={<CheckCircle2 className="h-3 w-3" />}
                                                onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                                                className="text-green-600 border-gray-200 hover:bg-green-50"
                                              >
                                                Complete
                                              </Button>
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                leftIcon={<XCircle className="h-3 w-3" />}
                                                onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                                                className="text-red-600 border-gray-200 hover:bg-red-50"
                                              >
                                                Cancel
                                              </Button>
                                            </>
                                          )}
                                          {(appointment.status === 'completed' || appointment.status === 'cancelled') && (
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              leftIcon={<RotateCcw className="h-3 w-3" />}
                                              onClick={() => handleStatusUpdate(appointment.id, 'scheduled')}
                                              className="text-blue-600 border-gray-200 hover:bg-blue-50"
                                            >
                                              Reopen
                                            </Button>
                                          )}
                                        </>
                                      )}
                                      
                                      {/* Edit and Delete buttons for all authorized users */}
                                      <div className="flex space-x-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          leftIcon={<Edit className="h-3 w-3" />}
                                          onClick={() => handleEditAppointment(appointment.id)}
                                          className="text-gray-600 border-gray-200 hover:bg-gray-50"
                                        >
                                          Edit
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          leftIcon={<Trash2 className="h-3 w-3" />}
                                          onClick={() => handleDeleteAppointment(appointment.id)}
                                          className="text-red-600 border-gray-200 hover:bg-red-50"
                                        >
                                          Delete
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="bg-white rounded-lg p-8 max-w-md mx-auto border border-gray-200">
                      <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments</h3>
                      <p className="text-gray-500 mb-6">
                        {user?.role === 'patient' 
                          ? 'You don\'t have any appointments scheduled yet.'
                          : user?.role === 'doctor'
                          ? 'You don\'t have any patient appointments scheduled yet.'
                          : 'No appointments scheduled yet.'
                        }
                      </p>
                      {user?.role === 'patient' && (
                        <Button
                          onClick={() => navigate('/appointments/new')}
                          leftIcon={<Plus className="h-4 w-4" />}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Book Your First Appointment
                        </Button>
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

export default AppointmentsPage;