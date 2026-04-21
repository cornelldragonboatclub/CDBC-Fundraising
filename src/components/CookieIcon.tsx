import React from 'react';

export default function CookieIcon({ size = "100%", className = '', ...props }: { size?: number | string; className?: string; [key: string]: any }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`drop-shadow-sm overflow-visible ${className}`}
      {...props}
    >
      {/* Main Cookie Base */}
      <circle cx="50" cy="50" r="45" fill="#6B8E23" />
      <circle cx="50" cy="50" r="41" fill="#7CB342" />

      {/* White Chocolate Chips / Matcha Powder Specs */}
      <circle cx="20" cy="35" r="3.5" fill="#FFFFFF" />
      <circle cx="78" cy="38" r="2.5" fill="#FFFFFF" />
      <circle cx="30" cy="78" r="4" fill="#FFFFFF" />
      <circle cx="75" cy="72" r="3" fill="#FFFFFF" />
      <circle cx="60" cy="20" r="2.5" fill="#FFFFFF" />
      <circle cx="15" cy="60" r="2" fill="#FFFFFF" />
      <circle cx="85" cy="55" r="1.5" fill="#FFFFFF" />
      <circle cx="45" cy="82" r="2" fill="#FFFFFF" />

      {/* Blush - Smaller r=4 (was 6) */}
      <circle cx="28" cy="58" r="4" fill="#FF8A8A" opacity="0.8" />
      <circle cx="72" cy="58" r="4" fill="#FF8A8A" opacity="0.8" />

      {/* Kawaii Eyes - Smaller r=4 (was 5) */}
      {/* Left Eye */}
      <circle cx="36" cy="50" r="4" fill="#2D2D2D" />
      <circle cx="34.5" cy="48" r="1.5" fill="#FFFFFF" /> {/* Glint */}
      
      {/* Right Eye */}
      <circle cx="64" cy="50" r="4" fill="#2D2D2D" />
      <circle cx="62.5" cy="48" r="1.5" fill="#FFFFFF" /> {/* Glint */}

      {/* Cute Smile - Semicircle */}
      <path
        d="M 46 54 A 4 4 0 0 0 54 54 Z"
        fill="#2D2D2D"
      />
    </svg>
  );
}
