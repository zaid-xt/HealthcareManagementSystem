// ProtectedRoute.tsx
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requiredPermissions?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = [], 
  requiredPermissions = [] 
}) => {
  const { user, isLoading } = useAuth();

  console.log('🛡️ ProtectedRoute check:', { 
    isLoading, 
    hasUser: !!user,
    userEmail: user?.email, 
    userRole: user?.role,
    currentPath: window.location.pathname,
    allowedRoles 
  });

  if (isLoading) {
    console.log('⏳ ProtectedRoute: Still loading auth state...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  if (!user) {
    console.log('❌ ProtectedRoute: No user found, redirecting to signin');
    return <Navigate to="/signin" replace />;
  }

  // Check if user role is allowed
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    console.log('🚫 ProtectedRoute: Role not allowed', { 
      userRole: user.role, 
      allowedRoles 
    });
    
    // Redirect to appropriate page based on role
    switch (user.role) {
      case 'patient':
        console.log('🔄 Redirecting patient to /welcome');
        return <Navigate to="/welcome" replace />;
      case 'admin':
      case 'doctor':
        console.log('🔄 Redirecting staff to /dashboard');
        return <Navigate to="/dashboard" replace />;
      default:
        console.log('🚫 Unknown role, redirecting to unauthorized');
        return <Navigate to="/unauthorized" replace />;
    }
  }

  // Check permissions if required
  if (requiredPermissions.length > 0) {
    const hasPermission = requiredPermissions.some(permission => 
      user.permissions?.includes(permission)
    );
    if (!hasPermission) {
      console.log('🚫 ProtectedRoute: Missing permissions', { 
        requiredPermissions,
        userPermissions: user.permissions 
      });
      return <Navigate to="/unauthorized" replace />;
    }
  }

  console.log('✅ ProtectedRoute: Access granted to', user.role);
  return <>{children}</>;
};

export default ProtectedRoute;