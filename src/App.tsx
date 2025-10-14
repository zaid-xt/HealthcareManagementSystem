import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import WelcomePage from './pages/WelcomePage';
import AppointmentsPage from './pages/AppointmentsPage';
import NewAppointmentPage from './pages/NewAppointmentPage';
import PatientsPage from './pages/PatientsPage';
import DoctorsPage from './pages/DoctorsPage';
import WardsPage from './pages/WardsPage';
import MedicalRecordsPage from './pages/MedicalRecordsPage';
import PatientMedicalRecordsPage from './pages/PatientsMedicalRecordsPage';
import MessagesPage from './pages/MessagesPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import LabResultsPage from './pages/LabResultsPage';
import ProfilePage from './pages/ProfilePage';
import PrescriptionsPage from './pages/PrescriptionsPage';
import EditAppointmentPage from './pages/EditAppointmentPage';

// Root redirect component
const RootRedirect: React.FC = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (user) {
    switch (user.role) {
      case 'admin':
      case 'doctor':
        return <Navigate to="/dashboard" replace />;
      case 'patient':
        return <Navigate to="/welcome" replace />;
      default:
        return <Navigate to="/signin" replace />;
    }
  }
  
  return <Navigate to="/signin" replace />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <NotificationProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<RootRedirect />} />
              <Route path="/signin" element={<SignInPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              
              {/* Welcome Page for Patients */}
              <Route
                path="/welcome"
                element={
                  <ProtectedRoute allowedRoles={['patient']}>
                    <WelcomePage />
                  </ProtectedRoute>
                }
              />
              
              {/* Protected Admin Routes */}
              <Route
                path="/admin/doctors"
                element={
                  <ProtectedRoute allowedRoles={['admin']} requiredPermissions={['manage_doctors']}>
                    <DoctorsPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Routes for Admin and Doctor */}
              <Route
                path="/patients"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'doctor']} requiredPermissions={['manage_patients']}>
                    <PatientsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/wards"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'doctor']} requiredPermissions={['manage_wards']}>
                    <WardsPage />
                  </ProtectedRoute>
                }
              />

              {/* Dashboard - Admin and Doctor only */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'doctor']}>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Appointments - All roles */}
              <Route
                path="/appointments"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'doctor', 'patient']}>
                    <AppointmentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/appointments/new"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'patient']}>
                    <NewAppointmentPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/appointments/edit/:id"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'patient', 'doctor']}>
                    <EditAppointmentPage />
                  </ProtectedRoute>
                }
              />

              {/* Medical Records - Separate pages for different roles */}
              <Route
                path="/medical-records"
                element={
                  <ProtectedRoute 
                    allowedRoles={['admin', 'doctor']} 
                    requiredPermissions={['manage_medical_records']}
                  >
                    <MedicalRecordsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-medical-records"
                element={
                  <ProtectedRoute allowedRoles={['patient']}>
                    <PatientMedicalRecordsPage />
                  </ProtectedRoute>
                }
              />

              {/* Messages - All roles */}
              <Route
                path="/messages"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'doctor', 'patient']}>
                    <MessagesPage />
                  </ProtectedRoute>
                }
              />

              {/* Lab Results - Admin and Doctor only */}
              <Route
                path="/lab-results"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'doctor']}>
                    <LabResultsPage />
                  </ProtectedRoute>
                }
              />

              {/* Prescriptions - All roles */}
              <Route
                path="/prescriptions"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'doctor', 'patient']}>
                    <PrescriptionsPage />
                  </ProtectedRoute>
                }
              />

              {/* Profile - All roles */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'doctor', 'patient']}>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Router>
        </NotificationProvider>
      </WebSocketProvider>
    </AuthProvider>
  );
};

export default App;