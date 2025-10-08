import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, User, FileText, CheckCircle, MapPin, Stethoscope, Edit, Trash2, MoreVertical } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { appointments, doctors, patients } from '../utils/mockData';
import type { Appointment } from '../types';

const AppointmentsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [localAppointments, setLocalAppointments] = useState<Appointment[]>(appointments);
  const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null);

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

  // Filter appointments based on user role
  const filteredAppointments = localAppointments.filter(appointment => {
    if (user?.role === 'patient') {
      return appointment.patientId === user.id;
    } else if (user?.role === 'doctor') {
      return appointment.doctorId === user.id;
    }
    return true; // Admin sees all appointments
  });

  // Sort appointments by date (most recent first)
  const sortedAppointments = [...filteredAppointments].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleDeleteAppointment = (appointmentId: string) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      const updatedAppointments = localAppointments.filter(appt => appt.id !== appointmentId);
      setLocalAppointments(updatedAppointments);
      setShowActionsMenu(null);
      
      // Show success message
      setSuccessMessage('Appointment deleted successfully');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }
  };

  const handleEditAppointment = (appointmentId: string) => {
    navigate(`/appointments/edit/${appointmentId}`);
    setShowActionsMenu(null);
  };

  const canModifyAppointment = (appointment: Appointment) => {
    if (user?.role === 'admin') return true;
    if (user?.role === 'patient' && appointment.patientId === user.id) return true;
    if (user?.role === 'doctor' && appointment.doctorId === user.id) return true;
    return false;
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
        return <Calendar className="h-3 w-3" />;
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
                        : 'Your appointment has been scheduled successfully.'
                      }
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">Appointments</h1>
                  <p className="text-gray-600 mt-1">
                    {user?.role === 'patient' 
                      ? 'Your upcoming and past appointments'
                      : user?.role === 'doctor'
                      ? 'Your patient appointments'
                      : 'All appointments management'
                    }
                  </p>
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
                        {user?.role === 'patient' ? 'Your Appointments' : 'All Appointments'}
                      </h2>
                    </div>
                    <ul className="divide-y divide-gray-200">
                      {sortedAppointments.map(appointment => {
                        const doctor = doctors.find(d => d.id === appointment.doctorId);
                        const patient = patients.find(p => p.id === appointment.patientId);
                        const canModify = canModifyAppointment(appointment);
                        
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
                                          ? `Dr. ${doctor?.firstName} ${doctor?.lastName}`
                                          : `${patient?.firstName} ${patient?.lastName}`
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
                                      {doctor?.specialization}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1 flex items-center">
                                      <MapPin className="h-4 w-4 mr-1" />
                                      {appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1)} Appointment
                                    </p>
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
                                      <Calendar className="h-4 w-4 mr-1" />
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
                                  
                                  {/* Actions Menu */}
                                  {canModify && (
                                    <div className="relative">
                                      <button
                                        onClick={() => setShowActionsMenu(
                                          showActionsMenu === appointment.id ? null : appointment.id
                                        )}
                                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                      >
                                        <MoreVertical className="h-4 w-4" />
                                      </button>
                                      
                                      {showActionsMenu === appointment.id && (
                                        <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-32">
                                          <button
                                            onClick={() => handleEditAppointment(appointment.id)}
                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                          >
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit
                                          </button>
                                          <button
                                            onClick={() => handleDeleteAppointment(appointment.id)}
                                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                          >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                          </button>
                                        </div>
                                      )}
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