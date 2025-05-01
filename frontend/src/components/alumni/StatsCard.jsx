import React from 'react';

const StatsCard = ({ title, value, icon, color }) => {
  const getIcon = () => {
    switch (icon) {
      case 'briefcase':
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        );
      case 'check-circle':
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        );
      case 'users':
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-lg font-semibold text-gray-800">{title}</p>
          <h3 className={`text-3xl font-bold text-${color}-600 mt-2`}>{value}</h3>
        </div>
        <div className={`bg-${color}-100 rounded-lg p-3`}>
          <svg className={`w-8 h-8 text-${color}-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {getIcon()}
          </svg>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
