import React from 'react';

export default function EggTartIcon({ size = "100%", className = '', ...props }: { size?: number | string; className?: string; [key: string]: any }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`drop-shadow-md overflow-visible ${className}`}
      {...props}
    >
      {/* Soft Brown Outlines */}
      {/* Base crust outline */}
      <circle cx="50" cy="50" r="42" fill="#6d5c50" stroke="#6d5c50" strokeWidth="6" />
      {/* Ruffles outline */}
      <circle cx="50" cy="50" r="42" fill="none" stroke="#6d5c50" strokeWidth="22" strokeLinecap="round" strokeDasharray="0.1 21.88" />

      {/* Outer Ruffled Crust - Light Beige */}
      {/* Base solid crust */}
      <circle cx="50" cy="50" r="42" fill="#fef3c7" />
      {/* Ruffles (using thick dashed stroke with rounded caps) */}
      <circle cx="50" cy="50" r="42" fill="none" stroke="#fef3c7" strokeWidth="16" strokeLinecap="round" strokeDasharray="0.1 21.88" />
      
      {/* Inner Crust Shadow/Depth */}
      <circle cx="50" cy="50" r="38" fill="#fdf0d5" />

      {/* Custard Filling - Golden yellow */}
      <circle cx="50" cy="50" r="32" fill="#fbbf24" />
      {/* Slight depth to custard, but carefully no shiny highlights */}
      <circle cx="50" cy="52" r="29" fill="#f59e0b" />

      {/* Cute Face - Same style as Onigiri */}
      {/* Eyes */}
      <g fill="#000000">
        <circle cx="38" cy="48" r="4.2" />
        <circle cx="62" cy="48" r="4.2" />
      </g>
      
      {/* Eye Glints */}
      <g fill="white">
        <circle cx="37" cy="46.5" r="1.5" />
        <circle cx="61" cy="46.5" r="1.5" />
      </g>

      {/* Open Mouth - Rounded Semicircle */}
      <path 
        d="M 46 51 A 4 4 0 0 0 54 51 Z" 
        fill="#4f3b3d" 
        stroke="#3d3935"
        strokeWidth="0.8"
      />

      {/* Blush */}
      <circle cx="28" cy="56" r="3" fill="#fb9fa4" opacity="0.9" />
      <circle cx="72" cy="56" r="3" fill="#fb9fa4" opacity="0.9" />
    </svg>
  );
}
