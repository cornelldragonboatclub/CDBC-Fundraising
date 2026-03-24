import React from 'react';

export default function CheThaiCup({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 120" className={`w-full h-full drop-shadow-md overflow-visible ${className}`}>
      {/* Straw */}
      <rect x="42" y="5" width="16" height="40" fill="#f472b6" stroke="#831843" strokeWidth="2" rx="2" transform="rotate(5 48 25)" />
      
      {/* Dome Lid */}
      <path d="M 25 45 C 25 15, 75 15, 75 45" fill="#e0f2fe" opacity="0.8" stroke="#0c4a6e" strokeWidth="2" />
      <path d="M 35 25 C 40 20, 45 20, 50 22" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
      
      {/* Lid Rim */}
      <rect x="20" y="45" width="60" height="6" fill="#e0f2fe" stroke="#0c4a6e" strokeWidth="2" rx="3" />
      
      {/* Cup Body */}
      <path d="M 25 51 L 32 110 C 33 115, 67 115, 68 110 L 75 51 Z" fill="#fffbeb" stroke="#451a03" strokeWidth="2" />
      
      {/* Liquid / Milk Tea Base */}
      <path d="M 26 60 L 31.5 108 C 32.5 113, 67.5 113, 68.5 108 L 74 60 Z" fill="#fef3c7" />

      {/* Cute Face */}
      <circle cx="40" cy="65" r="3" fill="#451a03" />
      <circle cx="60" cy="65" r="3" fill="#451a03" />
      <path d="M 46 68 Q 50 72 54 68" fill="none" stroke="#451a03" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="35" cy="68" rx="4" ry="2" fill="#fca5a5" opacity="0.8" />
      <ellipse cx="65" cy="68" rx="4" ry="2" fill="#fca5a5" opacity="0.8" />

      {/* Pink Jelly */}
      <path d="M 30 75 Q 35 70 40 76 T 50 74 T 60 76 T 70 73" fill="none" stroke="#f472b6" strokeWidth="4" strokeLinecap="round" />
      <path d="M 32 80 Q 38 75 45 80 T 55 78 T 68 80" fill="none" stroke="#f472b6" strokeWidth="4" strokeLinecap="round" />

      {/* Green Cubes */}
      <rect x="32" y="82" width="7" height="7" fill="#84cc16" stroke="#3f6212" strokeWidth="1" rx="1" transform="rotate(-10 35 85)" />
      <rect x="42" y="84" width="8" height="8" fill="#84cc16" stroke="#3f6212" strokeWidth="1" rx="1" transform="rotate(15 46 88)" />
      <rect x="55" y="81" width="7" height="7" fill="#84cc16" stroke="#3f6212" strokeWidth="1" rx="1" transform="rotate(-5 58 84)" />
      <rect x="63" y="83" width="6" height="6" fill="#84cc16" stroke="#3f6212" strokeWidth="1" rx="1" transform="rotate(20 66 86)" />

      {/* Black Cubes */}
      <rect x="35" y="90" width="8" height="8" fill="#1c1917" stroke="#000000" strokeWidth="1" rx="1" transform="rotate(5 39 94)" />
      <rect x="48" y="92" width="9" height="9" fill="#1c1917" stroke="#000000" strokeWidth="1" rx="1" transform="rotate(-15 52 96)" />
      <rect x="60" y="89" width="7" height="7" fill="#1c1917" stroke="#000000" strokeWidth="1" rx="1" transform="rotate(10 63 92)" />

      {/* White Pearls */}
      <circle cx="38" cy="100" r="2.5" fill="#ffffff" stroke="#d6d3d1" strokeWidth="0.5" />
      <circle cx="45" cy="102" r="3" fill="#ffffff" stroke="#d6d3d1" strokeWidth="0.5" />
      <circle cx="55" cy="100" r="2" fill="#ffffff" stroke="#d6d3d1" strokeWidth="0.5" />
      <circle cx="62" cy="103" r="2.5" fill="#ffffff" stroke="#d6d3d1" strokeWidth="0.5" />

      {/* Brown Boba */}
      <circle cx="36" cy="106" r="3.5" fill="#451a03" />
      <circle cx="44" cy="108" r="4" fill="#451a03" />
      <circle cx="52" cy="106" r="3.5" fill="#451a03" />
      <circle cx="60" cy="108" r="4" fill="#451a03" />
      <circle cx="66" cy="105" r="3" fill="#451a03" />
    </svg>
  );
}
