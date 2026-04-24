import React from 'react';

const SailboatIcon: React.FC = () => {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
      {/* Hull */}
      <path d="M 15 65 L 85 65 L 75 85 L 25 85 Z" fill="#78350f" />
      <path d="M 25 65 L 75 65 L 70 75 L 30 75 Z" fill="#92400e" />
      
      {/* Mast */}
      <rect x="47" y="15" width="6" height="50" fill="#451a03" />
      
      {/* Main Sail */}
      <path d="M 53 20 L 80 55 L 53 55 Z" fill="#f8fafc" />
      <path d="M 53 25 L 72 50 L 53 50 Z" fill="#cbd5e1" opacity="0.5" />
      
      {/* Jib / Small Sail */}
      <path d="M 47 25 L 47 55 L 25 55 Z" fill="#f1f5f9" />
    </svg>
  );
};

export default SailboatIcon;
