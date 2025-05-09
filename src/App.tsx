import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import AppointmentsPage from './pages/AppointmentsPage';
import AppointmentForm from './components/appointments/AppointmentForm';
import PatientsPage from './pages/PatientsPage';
import DoctorsPage from './pages/DoctorsPage';
import WardsPage from './pages/WardsPage';
import MedicalRecordsPage from './pages/MedicalRecordsPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          
          {/* Protected Admin Routes */}
          <Route
            path="/admin/doctors"
            element={
              <ProtectedRoute allowedRoles={['admin']} requiredPermissions={['manage_doctors']}>
                <DoctorsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/patients"
            element={
              <ProtectedRoute allowedRoles={['admin']} requiredPermissions={['manage_patients']}>
                <PatientsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/wards"
            element={
              <ProtectedRoute allowedRoles={['admin']} requiredPermissions={['manage_wards']}>
                <WardsPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Doctor Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin', 'doctor', 'patient']}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
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
                <AppointmentForm onSubmit={console.log} />
              </ProtectedRoute>
            }
          />
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

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;