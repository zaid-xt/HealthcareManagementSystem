import React from 'react';

const WardsPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Hospital Wards</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder for ward list - to be implemented */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">General Ward</h2>
          <div className="space-y-2">
            <p className="text-gray-600">Capacity: 20 beds</p>
            <p className="text-gray-600">Current Occupancy: 15</p>
            <p className="text-gray-600">Status: Available</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WardsPage;