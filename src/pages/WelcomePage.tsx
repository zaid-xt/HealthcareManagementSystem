// WelcomePage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, FileText, MessageSquare, User, Pill, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';

const WelcomePage: React.FC = () => {
  const { user } = useAuth();

  const quickActions = [
    {
      icon: <FileText className="h-8 w-8" />,
      title: 'My Medical Records',
      description: 'View your complete medical history and health records',
      href: '/my-medical-records',
      color: 'bg-blue-500'
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      title: 'Appointments',
      description: 'Schedule and manage your doctor appointments',
      href: '/appointments',
      color: 'bg-green-500'
    },
    {
      icon: <Pill className="h-8 w-8" />,
      title: 'Prescriptions',
      description: 'View your current medications and prescriptions',
      href: '/prescriptions',
      color: 'bg-purple-500'
    },
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: 'Messages',
      description: 'Communicate with your healthcare providers',
      href: '/messages',
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Header */}
            <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <Heart className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Welcome back, {user?.name}!
                  </h1>
                  <p className="text-gray-600 mt-2">
                    Here's your personal healthcare dashboard. Everything you need to manage your health is right here.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    to={action.href}
                    className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className={`${action.color} h-12 w-12 rounded-lg flex items-center justify-center text-white mb-4`}>
                      {action.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {action.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {action.description}
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Health Tips Section */}
            <div className="bg-blue-50 rounded-lg p-6 mt-8">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Health Tips</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-blue-800">
                  • Remember to take your medications as prescribed
                </div>
                <div className="text-blue-800">
                  • Stay hydrated and maintain a balanced diet
                </div>
                <div className="text-blue-800">
                  • Don't hesitate to message your doctor with any concerns
                </div>
                <div className="text-blue-800">
                  • Keep your emergency contact information updated
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default WelcomePage;