import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, User, FileText, X, RefreshCw } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Button from '../components/ui/Button';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import BookAppointmentModal from '../components/appointments/BookAppointmentModal';
import RescheduleModal from '../components/appointments/RescheduleModal';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { appointmentsApi } from '../api/appointmentsApi';
import { doctors, patients } from '../utils/mockData';
import type { Appointment } from '../types';

const AppointmentsPage: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, [user]);

  const loadAppointments = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const data = await appointmentsApi.getAll(user.id, user.role);
      setAppointments(data);
    } catch (error) {
      showNotification('Failed to load appointments', 'error');
      console.error('Error loading appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookAppointment = async (formData: {
    doctorId: string;
    date: string;
    time: string;
    type: string;
    notes: string;
  }) => {
    if (!user) return;

    try {
      setIsSubmitting(true);
      const [hours, minutes] = formData.time.split(':');
      const endHours = Number(hours) + (Number(minutes) + 30 >= 60 ? 1 : 0);
      const endMinutes = (Number(minutes) + 30) % 60;
      const endTime = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;

      await appointmentsApi.create({
        patient_id: user.id,
        doctor_id: formData.doctorId,
        date: formData.date,
        start_time: formData.time,
        end_time: endTime,
        type: formData.type as 'regular' | 'follow-up' | 'emergency',
        notes: formData.notes,
        created_by: user.id,
      });

      showNotification('Appointment booked successfully', 'success');
      setIsBookModalOpen(false);
      loadAppointments();
    } catch (error) {
      showNotification('Failed to book appointment', 'error');
      console.error('Error booking appointment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReschedule = async (date: string, time: string) => {
    if (!selectedAppointment) return;

    try {
      setIsSubmitting(true);
      const [hours, minutes] = time.split(':');
      const endHours = Number(hours) + (Number(minutes) + 30 >= 60 ? 1 : 0);
      const endMinutes = (Number(minutes) + 30) % 60;
      const endTime = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;

      await appointmentsApi.update(selectedAppointment.id, {
        date,
        start_time: time,
        end_time: endTime,
      });

      showNotification('Appointment rescheduled successfully', 'success');
      setIsRescheduleModalOpen(false);
      setSelectedAppointment(null);
      loadAppointments();
    } catch (error) {
      showNotification('Failed to reschedule appointment', 'error');
      console.error('Error rescheduling appointment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      setIsSubmitting(true);
      await appointmentsApi.cancel(selectedAppointment.id);
      showNotification('Appointment cancelled successfully', 'success');
      setIsCancelModalOpen(false);
      setSelectedAppointment(null);
      loadAppointments();
    } catch (error) {
      showNotification('Failed to cancel appointment', 'error');
      console.error('Error cancelling appointment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
                    onClick={() => setIsBookModalOpen(true)}
                    leftIcon={<Plus className="h-4 w-4" />}
                  >
                    Book Appointment
                  </Button>
                )}
              </div>

              <div className="mt-8">
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-sm text-gray-500">Loading appointments...</p>
                  </div>
                ) : appointments.length > 0 ? (
                  <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                      {appointments.map(appointment => {
                        const doctor = doctors.find(d => d.id === appointment.doctorId);
                        const patient = patients.find(p => p.id === appointment.patientId);
                        const canModify = user?.role === 'patient' && appointment.status === 'scheduled';

                        return (
                          <li key={appointment.id}>
                            <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center flex-1">
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
                                  {canModify && (
                                    <div className="flex space-x-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          setSelectedAppointment(appointment);
                                          setIsRescheduleModalOpen(true);
                                        }}
                                        leftIcon={<RefreshCw className="h-4 w-4" />}
                                      >
                                        Reschedule
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          setSelectedAppointment(appointment);
                                          setIsCancelModalOpen(true);
                                        }}
                                        leftIcon={<X className="h-4 w-4" />}
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  )}
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
                        ? 'Get started by booking your first appointment.'
                        : 'No appointments scheduled yet.'}
                    </p>
                    {user?.role === 'patient' && (
                      <div className="mt-6">
                        <Button
                          onClick={() => setIsBookModalOpen(true)}
                          leftIcon={<Plus className="h-4 w-4" />}
                        >
                          Book Appointment
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

      <BookAppointmentModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        onSubmit={handleBookAppointment}
        isLoading={isSubmitting}
      />

      <RescheduleModal
        isOpen={isRescheduleModalOpen}
        onClose={() => {
          setIsRescheduleModalOpen(false);
          setSelectedAppointment(null);
        }}
        onSubmit={handleReschedule}
        appointment={selectedAppointment}
        isLoading={isSubmitting}
      />

      <ConfirmationModal
        isOpen={isCancelModalOpen}
        onClose={() => {
          setIsCancelModalOpen(false);
          setSelectedAppointment(null);
        }}
        onConfirm={handleCancelAppointment}
        title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment? This action cannot be undone."
        confirmText="Cancel Appointment"
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default AppointmentsPage;