import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, LogOut, User, Settings, BellRing } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and main nav */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                </svg>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">HealthCare</span>
            </Link>
            
            <nav className="ml-10 hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Home
              </Link>
              {isAuthenticated && (
                <>
                  <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                    Dashboard
                  </Link>
                  <Link to="/appointments" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                    Appointments
                  </Link>
                  {(user?.role === 'admin' || user?.role === 'doctor') && (
                    <div className="relative group">
                      <button 
                        className="flex items-center text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                      >
                        Management <ChevronDown className="ml-1 h-4 w-4" />
                      </button>
                      <div 
                        className={`${isProfileOpen ? 'block' : 'hidden'} 
                          absolute left-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50`}
                      >
                        <Link to="/patients" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Patients
                        </Link>
                        <Link to="/doctors" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Doctors
                        </Link>
                        <Link to="/wards" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Wards
                        </Link>
                        <Link to="/medical-records" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Medical Records
                        </Link>
                        <Link to="/prescriptions" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Prescriptions
                        </Link>
                      </div>
                    </div>
                  )}
                </>
              )}
            </nav>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
          
          {/* Right side actions */}
          <div className="hidden md:flex md:items-center md:justify-end md:flex-1 lg:w-0">
            {isAuthenticated ? (
              <div className="ml-4 flex items-center md:ml-6 space-x-4">
                <button 
                  type="button" 
                  className="rounded-full bg-gray-100 p-1 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <BellRing className="h-6 w-6" />
                </button>
                
                <div className="relative">
                  <button
                    type="button"
                    className="flex max-w-xs items-center rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                  >
                    {user?.avatar ? (
                      <img
                        className="h-8 w-8 rounded-full object-cover"
                        src={user.avatar}
                        alt={user.name}
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <User className="h-5 w-5" />
                      </div>
                    )}
                  </button>
                  
                  <div 
                    className={`${isProfileOpen ? 'block' : 'hidden'} 
                      absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50`}
                  >
                    <div className="px-4 py-3">
                      <p className="text-sm">Signed in as</p>
                      <p className="truncate text-sm font-medium text-gray-900">{user?.email}</p>
                    </div>
                    
                    <div className="border-t border-gray-200"></div>
                    
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                      <User className="mr-2 h-4 w-4" /> Your Profile
                    </Link>
                    <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                      <Settings className="mr-2 h-4 w-4" /> Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <LogOut className="mr-2 h-4 w-4" /> Sign out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-x-4">
                <Link to="/signin">
                  <Button variant="outline" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="space-y-1 px-2 pb-3 pt-2">
          <Link to="/" className="block rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50">
            Home
          </Link>
          
          {isAuthenticated && (
            <>
              <Link to="/dashboard" className="block rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50">
                Dashboard
              </Link>
              <Link to="/appointments" className="block rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50">
                Appointments
              </Link>
              {(user?.role === 'admin' || user?.role === 'doctor') && (
                <>
                  <Link to="/patients" className="block rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50">
                    Patients
                  </Link>
                  <Link to="/doctors" className="block rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50">
                    Doctors
                  </Link>
                  <Link to="/wards" className="block rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50">
                    Wards
                  </Link>
                </>
              )}
            </>
          )}
        </div>
        
        {isAuthenticated ? (
          <div className="border-t border-gray-200 pb-3 pt-4">
            <div className="flex items-center px-5">
              <div className="flex-shrink-0">
                {user?.avatar ? (
                  <img className="h-10 w-10 rounded-full" src={user.avatar} alt="" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <User className="h-6 w-6" />
                  </div>
                )}
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">{user?.name}</div>
                <div className="text-sm font-medium text-gray-500">{user?.email}</div>
              </div>
              <button
                type="button"
                className="ml-auto flex-shrink-0 rounded-full bg-gray-100 p-1 text-gray-400 hover:text-gray-500"
              >
                <BellRing className="h-6 w-6" />
              </button>
            </div>
            <div className="mt-3 space-y-1 px-2">
              <Link to="/profile" className="block rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50">
                Your Profile
              </Link>
              <Link to="/settings" className="block rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50">
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left block rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50"
              >
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <div className="border-t border-gray-200 py-4 px-4 flex flex-col space-y-3">
            <Link to="/signin">
              <Button variant="outline" fullWidth>
                Sign in
              </Button>
            </Link>
            <Link to="/signup">
              <Button fullWidth>
                Sign up
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;