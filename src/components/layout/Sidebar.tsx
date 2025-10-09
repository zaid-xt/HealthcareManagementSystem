import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Building,
  FileText,
  FlaskRound as Flask,
  Pill,
  Settings,
  ChevronRight,
  MessageSquare,
  User,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarItem {
  title: string;
  icon: React.ReactNode;
  path: string;
  roles?: string[];
}

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const sidebarItems: SidebarItem[] = [
    { title: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/dashboard' },
    { title: 'Appointments', icon: <Calendar className="w-5 h-5" />, path: '/appointments' },
    { title: 'Messages', icon: <MessageSquare className="w-5 h-5" />, path: '/messages' },
    { title: 'Patients', icon: <Users className="w-5 h-5" />, path: '/patients', roles: ['admin', 'doctor'] },
    { title: 'Doctors', icon: <Users className="w-5 h-5" />, path: '/admin/doctors', roles: ['admin'] },
    { title: 'Wards', icon: <Building className="w-5 h-5" />, path: '/wards', roles: ['admin', 'doctor', 'nurse'] },
    { title: 'Medical Records', icon: <FileText className="w-5 h-5" />, path: '/medical-records', roles: ['admin', 'doctor', 'nurse'] },
    { title: 'Lab Results', icon: <Flask className="w-5 h-5" />, path: '/lab-results', roles: ['admin', 'doctor'] },
    { title: 'Prescriptions', icon: <Pill className="w-5 h-5" />, path: '/prescriptions' },
  ];

  const filteredItems = user
    ? sidebarItems.filter(item => !item.roles || item.roles.includes(user.role))
    : [];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white shadow-sm border-r relative">
      <div className="flex-1 py-6 overflow-y-auto">
        <nav className="px-2 space-y-1">
          {filteredItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className={`mr-3 ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                  {item.icon}
                </div>
                {item.title}
                {isActive && <ChevronRight className="ml-auto h-4 w-4 text-blue-600" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User info & settings dropdown */}
      <div className="p-4 border-t relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {user?.avatar ? (
                <img className="h-8 w-8 rounded-full" src={user.avatar} alt={user.name} />
              ) : (
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <span className="text-xs font-medium">
                    {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </span>
                </div>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700 truncate">{user?.name || 'Guest'}</p>
              <p className="text-xs font-medium text-gray-500 truncate">
                {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''}
                {user?.role === 'doctor' && user?.specialization && (
                  <span className="block text-xs text-blue-600 truncate">{user.specialization}</span>
                )}
              </p>
            </div>
          </div>

          {/* Settings dropdown trigger */}
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="ml-2 p-2 rounded-full hover:bg-gray-100 text-gray-600"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>

        {/* Dropdown menu */}
        {isSettingsOpen && (
          <div className="absolute bottom-16 right-4 w-48 bg-white shadow-lg rounded-md ring-1 ring-black ring-opacity-5 z-50">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm text-gray-500">Signed in as</p>
              <p className="truncate text-sm font-medium text-gray-900">{user?.email}</p>
            </div>

            <Link
              to="/profile"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsSettingsOpen(false)}
            >
              <User className="h-4 w-4 mr-2" /> Your Profile
            </Link>
            {/* <Link
              to="/settings"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsSettingsOpen(false)}
            >
              <Settings className="h-4 w-4 mr-2" /> Settings
            </Link> */}
            <button
              onClick={handleLogout}
              className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <LogOut className="h-4 w-4 mr-2" /> Sign out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;