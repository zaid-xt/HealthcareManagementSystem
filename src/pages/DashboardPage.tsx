import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, Activity, Building, FlaskRound as Flask, Pill, ChevronRight, FileText } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import StatsCard from '../components/dashboard/StatsCard';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { labs, prescriptions } from '../utils/mockData';
import type { Ward, MedicalRecord } from '../types';
import { fetchWards } from '../api/wardsApi';
import { useWardUpdates } from '../hooks/useWardUpdates';
import { fetchPatients } from '../api/patientsApi';
import { fetchAppointments } from '../api/appointmentsApi';
import { fetchMedicalRecords } from '../api/medicalRecordsApi';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [wards, setWards] = useState<Ward[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [wardsLoading, setWardsLoading] = useState(true);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [medicalRecordsLoading, setMedicalRecordsLoading] = useState(true);
  const [wardsError, setWardsError] = useState<string | null>(null);
  const [patientsError, setPatientsError] = useState<string | null>(null);
  const [appointmentsError, setAppointmentsError] = useState<string | null>(null);
  const [medicalRecordsError, setMedicalRecordsError] = useState<string | null>(null);
  
  // Real-time ward update handlers
  const handleWardCreated = (newWard: Ward) => {
    setWards(prev => [...prev, { ...newWard, id: String(newWard.id) }]);
  };

  const handleWardUpdated = (updatedWard: Ward) => {
    setWards(prev => prev.map(ward => 
      ward.id === String(updatedWard.id) ? { ...updatedWard, id: String(updatedWard.id) } : ward
    ));
  };

  const handleWardDeleted = (wardId: string) => {
    setWards(prev => prev.filter(ward => ward.id !== wardId));
  };

  // Use real-time ward updates
  const { isConnected } = useWardUpdates({
    onWardCreated: handleWardCreated,
    onWardUpdated: handleWardUpdated,
    onWardDeleted: handleWardDeleted
  });

  // Fetch all data from API
  useEffect(() => {
    let mounted = true;

    const loadAllData = async () => {
      try {
        // Fetch wards
        setWardsLoading(true);
        const wardsData = await fetchWards();
        if (mounted) setWards(wardsData);
      } catch (e: any) {
        if (mounted) setWardsError(e?.message || 'Failed to load wards');
      } finally {
        if (mounted) setWardsLoading(false);
      }

      try {
        // Fetch patients
        setPatientsLoading(true);
        const patientsData = await fetchPatients();
        if (mounted) setPatients(patientsData);
      } catch (e: any) {
        if (mounted) setPatientsError(e?.message || 'Failed to load patients');
      } finally {
        if (mounted) setPatientsLoading(false);
      }

      try {
        // Fetch appointments
        setAppointmentsLoading(true);
        const appointmentsData = await fetchAppointments();
        if (mounted) setAppointments(appointmentsData);
      } catch (e: any) {
        if (mounted) setAppointmentsError(e?.message || 'Failed to load appointments');
      } finally {
        if (mounted) setAppointmentsLoading(false);
      }

      try {
        // Fetch medical records
        setMedicalRecordsLoading(true);
        let medicalRecordsData;
        
        if (user?.role === 'doctor') {
          const res = await fetch(`http://localhost:5000/api/medical-records/doctor/${user.id}`, {
            headers: {
              'user-id': user.id
            }
          });
          if (!res.ok) throw new Error('Failed to fetch doctor records');
          medicalRecordsData = await res.json();
        } else {
          medicalRecordsData = await fetchMedicalRecords();
        }
        
        if (mounted) setMedicalRecords(medicalRecordsData);
      } catch (e: any) {
        if (mounted) setMedicalRecordsError(e?.message || 'Failed to load medical records');
      } finally {
        if (mounted) setMedicalRecordsLoading(false);
      }
    };

    loadAllData();

    return () => { mounted = false; };
  }, [user]);

  // Fallback: Refresh data every 30 seconds if WebSocket is not connected
  useEffect(() => {
    if (isConnected) return; // Don't need fallback if WebSocket is working
    
    const interval = setInterval(async () => {
      try {
        const [wardsData, patientsData, appointmentsData, medicalRecordsData] = await Promise.all([
          fetchWards(),
          fetchPatients(),
          fetchAppointments(),
          user?.role === 'doctor' 
            ? fetch(`http://localhost:5000/api/medical-records/doctor/${user.id}`).then(res => res.json())
            : fetchMedicalRecords()
        ]);
        setWards(wardsData);
        setPatients(patientsData);
        setAppointments(appointmentsData);
        setMedicalRecords(medicalRecordsData);
      } catch (e: any) {
        console.log('Fallback refresh failed:', e?.message);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [isConnected, user]);
  
  // Filter appointments to only show today's and upcoming
  const today = new Date();
  const todayFormatted = today.toISOString().split('T')[0];
  
  const upcomingAppointments = appointments
    .filter(appointment => {
      const appointmentDate = new Date(appointment.date).toISOString().split('T')[0];
      return appointmentDate >= todayFormatted && appointment.status === 'scheduled';
    })
    .slice(0, 5);

  // Get today's appointments count
  const todaysAppointmentsCount = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date).toISOString().split('T')[0];
    return appointmentDate === todayFormatted;
  }).length;

  // Get recent medical records (last 5)
  const recentMedicalRecords = medicalRecords
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Get pending lab results (still using mock data for now)
  const pendingLabs = labs.filter(lab => lab.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {/* Updated Header Section */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Activity className="h-8 w-8 text-blue-600" />
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600 mt-1">
                      Welcome back, {user?.name}. Here's your hospital overview.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-600">
                    {today.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className={`flex items-center gap-2 text-xs px-2 py-1 rounded-full ${
                    isConnected 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      isConnected ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    {isConnected ? 'Live Updates' : 'Offline'}
                  </div>
                </div>
              </div>
              
              {/* Stats Cards */}
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <StatsCard 
                  title="Total Patients"
                  value={patientsLoading ? '...' : patientsError ? 'Error' : patients.length}
                  icon={<Users className="h-5 w-5" />}
                  description={patientsLoading ? 'Loading...' : patientsError ? 'Failed to load' : 'Registered patients'}
                  color="blue"
                />
                
                <StatsCard 
                  title="Today's Appointments"
                  value={appointmentsLoading ? '...' : appointmentsError ? 'Error' : todaysAppointmentsCount}
                  icon={<Calendar className="h-5 w-5" />}
                  description={appointmentsLoading ? 'Loading...' : appointmentsError ? 'Failed to load' : 'Scheduled for today'}
                  color="teal"
                />
                
                <div onClick={() => navigate('/wards')} className="cursor-pointer">
                  <StatsCard 
                    title="Available Beds"
                    value={wardsLoading ? '...' : wardsError ? 'Error' : wards.reduce((total, ward) => total + ward.availableBeds, 0)}
                    icon={<Building className="h-5 w-5" />}
                    description={wardsLoading ? 'Loading...' : wardsError ? 'Failed to load' : `Across ${wards.length} wards`}
                    color="purple"
                  />
                </div>
                
                <StatsCard 
                  title="Medical Records"
                  value={medicalRecordsLoading ? '...' : medicalRecordsError ? 'Error' : medicalRecords.length}
                  icon={<FileText className="h-5 w-5" />}
                  description={medicalRecordsLoading ? 'Loading...' : medicalRecordsError ? 'Failed to load' : 'Total records'}
                  color="amber"
                />
              </div>
              
              {/* Upcoming Appointments */}
              <div className="mt-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Upcoming Appointments</h2>
                  <Button 
                    variant="outline" 
                    size="sm"
                    rightIcon={<ChevronRight className="h-4 w-4" />}
                    onClick={() => navigate('/appointments')}
                  >
                    View all
                  </Button>
                </div>
                
                <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {appointmentsLoading ? (
                      <li>
                        <div className="px-4 py-5 sm:px-6 text-center text-gray-500">
                          Loading appointments...
                        </div>
                      </li>
                    ) : appointmentsError ? (
                      <li>
                        <div className="px-4 py-5 sm:px-6 text-center text-red-500">
                          Failed to load appointments
                        </div>
                      </li>
                    ) : upcomingAppointments.length > 0 ? (
                      upcomingAppointments.map((appointment) => {
                        const patientName = appointment.patientName || 'Unknown Patient';
                        
                        return (
                          <li key={appointment.id}>
                            <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <div className="mr-4 h-10 w-10 flex-shrink-0">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                      <span className="text-sm font-medium">
                                        {patientName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                      </span>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-blue-600 truncate">
                                      {patientName}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500 truncate">
                                      {appointment.type?.charAt(0).toUpperCase() + appointment.type?.slice(1) || 'Regular'} Appointment
                                      {appointment.doctorName && ` with Dr. ${appointment.doctorName}`}
                                    </p>
                                  </div>
                                </div>
                                <div className="ml-2 flex flex-shrink-0">
                                  <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                    {new Date(appointment.date).toLocaleDateString()} • {appointment.startTime} - {appointment.endTime}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </li>
                        );
                      })
                    ) : (
                      <li>
                        <div className="px-4 py-5 sm:px-6 text-center text-gray-500">
                          No upcoming appointments
                        </div>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
              
              <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
                {/* Recent Medical Records */}
                <div>
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium text-gray-900">Recent Medical Records</h2>
                    <Button 
                      variant="outline" 
                      size="sm"
                      rightIcon={<ChevronRight className="h-4 w-4" />}
                      onClick={() => navigate('/medical-records')}
                    >
                      View all
                    </Button>
                  </div>
                  
                  <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                      {medicalRecordsLoading ? (
                        <li>
                          <div className="px-4 py-5 sm:px-6 text-center text-gray-500">
                            Loading medical records...
                          </div>
                        </li>
                      ) : medicalRecordsError ? (
                        <li>
                          <div className="px-4 py-5 sm:px-6 text-center text-red-500">
                            Failed to load medical records
                          </div>
                        </li>
                      ) : recentMedicalRecords.length > 0 ? (
                        recentMedicalRecords.map((record) => {
                          const patient = patients.find(p => String(p.id) === String(record.patientId));
                          const patientName = patient?.name || 'Unknown Patient';
                          
                          return (
                            <li key={record.id}>
                              <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                  </div>
                                  <div className="ml-4 flex-1">
                                    <div className="text-sm font-medium text-gray-900">
                                      {patientName}
                                    </div>
                                    <div className="text-xs text-gray-500 truncate">
                                      {record.diagnosis}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                      {new Date(record.date).toLocaleDateString()} • 
                                      {record.symptoms?.slice(0, 2).join(', ')}
                                      {record.symptoms && record.symptoms.length > 2 && '...'}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </li>
                          );
                        })
                      ) : (
                        <li>
                          <div className="px-4 py-5 sm:px-6 text-center text-gray-500">
                            No medical records found
                          </div>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
                
                {/* Active Prescriptions */}
                <div>
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium text-gray-900">Active Prescriptions</h2>
                    <Button 
                      variant="outline" 
                      size="sm"
                      rightIcon={<ChevronRight className="h-4 w-4" />}
                      onClick={() => navigate('/prescriptions')}
                    >
                      View all
                    </Button>
                  </div>
                  
                  <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                      {prescriptions.filter(p => p.status === 'active').length > 0 ? (
                        prescriptions.filter(p => p.status === 'active').slice(0, 3).map((prescription) => {
                          const patient = patients.find(p => p.id === prescription.patientId);
                          const patientName = patient?.name || 'Unknown Patient';
                          
                          return (
                            <li key={prescription.id}>
                              <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0">
                                    <Pill className="h-5 w-5 text-green-600" />
                                  </div>
                                  <div className="ml-4 flex-1">
                                    <div className="text-sm font-medium text-gray-900">
                                      {patientName}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      Prescribed on {new Date(prescription.date).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </li>
                          );
                        })
                      ) : (
                        <li>
                          <div className="px-4 py-5 sm:px-6 text-center text-gray-500">
                            No active prescriptions
                          </div>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;