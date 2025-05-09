import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, Activity, Building, FlaskRound as Flask, Pill, ChevronRight } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import StatsCard from '../components/dashboard/StatsCard';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { patients, appointments, wards, labs, prescriptions } from '../utils/mockData';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Filter appointments to only show today's and upcoming
  const today = new Date();
  const todayFormatted = today.toISOString().split('T')[0];
  
  const upcomingAppointments = appointments
    .filter(appointment => appointment.date >= todayFormatted && appointment.status === 'scheduled')
    .slice(0, 5);
  
  // Get pending lab results
  const pendingLabs = labs.filter(lab => lab.status === 'pending').length;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                <div className="text-sm text-gray-600">
                  {today.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
              
              {/* Welcome Card */}
              <div className="mt-6 bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900">Welcome back, {user?.name}</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Here's what's happening with your hospital today.
                  </p>
                </div>
              </div>
              
              {/* Stats Cards */}
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <StatsCard 
                  title="Total Patients"
                  value={patients.length}
                  icon={<Users className="h-5 w-5" />}
                  trend={{ value: 12, isPositive: true }}
                  color="blue"
                />
                
                <StatsCard 
                  title="Today's Appointments"
                  value={appointments.filter(a => a.date === todayFormatted).length}
                  icon={<Calendar className="h-5 w-5" />}
                  description="Scheduled for today"
                  color="teal"
                />
                
                <StatsCard 
                  title="Available Beds"
                  value={wards.reduce((total, ward) => total + ward.availableBeds, 0)}
                  icon={<Building className="h-5 w-5" />}
                  description={`Across ${wards.length} wards`}
                  color="purple"
                />
                
                <StatsCard 
                  title="Pending Lab Results"
                  value={pendingLabs}
                  icon={<Flask className="h-5 w-5" />}
                  trend={{ value: 5, isPositive: false }}
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
                    {upcomingAppointments.length > 0 ? (
                      upcomingAppointments.map((appointment) => {
                        const patient = patients.find(p => p.id === appointment.patientId);
                        
                        return (
                          <li key={appointment.id}>
                            <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <div className="mr-4 h-10 w-10 flex-shrink-0">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                      <span className="text-sm font-medium">
                                        {patient?.firstName[0]}{patient?.lastName[0]}
                                      </span>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-blue-600 truncate">
                                      {patient?.firstName} {patient?.lastName}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500 truncate">
                                      {appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1)} Appointment
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
                    <div className="p-4 sm:p-6">
                      <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      </div>
                      <div className="mt-6 text-center text-sm text-gray-500">
                        Medical records will be displayed here
                      </div>
                    </div>
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
                          
                          return (
                            <li key={prescription.id}>
                              <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0">
                                    <Pill className="h-5 w-5 text-green-600" />
                                  </div>
                                  <div className="ml-4 flex-1">
                                    <div className="text-sm font-medium text-gray-900">
                                      {patient?.firstName} {patient?.lastName}
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
              
              {/* Activity Log */}
              <div className="mt-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
                </div>
                
                <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flow-root">
                      <ul className="-mb-8">
                        <li>
                          <div className="relative pb-8">
                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                            <div className="relative flex space-x-3">
                              <div>
                                <span className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center ring-8 ring-white">
                                  <Activity className="h-5 w-5 text-blue-600" />
                                </span>
                              </div>
                              <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                <div>
                                  <p className="text-sm text-gray-500">
                                    New patient <span className="font-medium text-gray-900">Emily Chen</span> registered
                                  </p>
                                </div>
                                <div className="whitespace-nowrap text-right text-sm text-gray-500">
                                  1h ago
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                        
                        <li>
                          <div className="relative pb-8">
                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                            <div className="relative flex space-x-3">
                              <div>
                                <span className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center ring-8 ring-white">
                                  <Calendar className="h-5 w-5 text-green-600" />
                                </span>
                              </div>
                              <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                <div>
                                  <p className="text-sm text-gray-500">
                                    Appointment with <span className="font-medium text-gray-900">Jane Smith</span> completed
                                  </p>
                                </div>
                                <div className="whitespace-nowrap text-right text-sm text-gray-500">
                                  3h ago
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                        
                        <li>
                          <div className="relative">
                            <div className="relative flex space-x-3">
                              <div>
                                <span className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center ring-8 ring-white">
                                  <Flask className="h-5 w-5 text-purple-600" />
                                </span>
                              </div>
                              <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                <div>
                                  <p className="text-sm text-gray-500">
                                    Lab results for <span className="font-medium text-gray-900">Michael Johnson</span> received
                                  </p>
                                </div>
                                <div className="whitespace-nowrap text-right text-sm text-gray-500">
                                  5h ago
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      </ul>
                    </div>
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