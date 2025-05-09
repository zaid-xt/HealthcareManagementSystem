import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'teal' | 'amber' | 'purple' | 'red' | 'green';
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  description,
  trend,
  color = 'blue'
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    teal: 'bg-teal-50 text-teal-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
    green: 'bg-green-50 text-green-600'
  };
  
  const trendColorClasses = {
    positive: 'text-green-600',
    negative: 'text-red-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg">
      <div className="p-6">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-lg p-3 ${colorClasses[color]}`}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-2xl font-bold text-gray-900">{value}</div>
              </dd>
              {description && (
                <dd className="mt-1 text-sm text-gray-500">
                  {description}
                </dd>
              )}
            </dl>
          </div>
        </div>
      </div>
      
      {trend && (
        <div className="bg-gray-50 px-6 py-3">
          <div className="flex items-center">
            <span className={trendColorClasses[trend.isPositive ? 'positive' : 'negative']}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}%
            </span>
            <span className="text-gray-500 text-sm ml-2">from previous period</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsCard;