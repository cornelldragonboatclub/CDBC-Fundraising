import React from 'react';

const BuoyIcon: React.FC = () => {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
      {/* Base Ring */}
      <circle cx="50" cy="50" r="35" stroke="#ef4444" strokeWidth="12" />
      <circle cx="50" cy="50" r="35" stroke="white" strokeWidth="12" strokeDasharray="55 55" strokeDashoffset="27" />
      
      {/* Inner Hole */}
      <circle cx="50" cy="50" r="18" fill="transparent" stroke="#b91c1c" strokeWidth="2" opacity="0.3" />
      
      {/* Ropes / Details */}
      <circle cx="50" cy="50" r="41" stroke="#fef2f2" strokeWidth="1" strokeDasharray="2 4" />
    </svg>
  );
};

export default BuoyIcon;
