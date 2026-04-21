import React from 'react';

export default function OnigiriIcon({ size = "100%", className = '', ...props }: { size?: number | string; className?: string; [key: string]: any }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`drop-shadow-sm overflow-visible ${className}`}
      {...props}
    >
      {/* Main Body - Plump Rounded Triangle (Scaled down more for better centering) */}
      <path
        d="M 50 22 
           C 68 22 84 45 84 70 
           C 84 82 68 88 50 88 
           C 32 88 16 82 16 70 
           C 16 45 32 22 50 22 Z"
        fill="#fdfbf3"
        stroke="#3d3935"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Seaweed (Nori) */}
      <g transform="translate(38, 62)">
        <rect width="24" height="28" rx="3" ry="3" fill="#35342c" stroke="#3d3935" strokeWidth="2.5" />
        {/* Nori Highlight */}
        <path d="M 3 3 L 8 3 L 3 8 Z" fill="#4a493d" opacity="0.5" />
      </g>

      {/* Cute Face */}
      {/* Eyes - Smaller r=4 (was 5.5) */}
      <g fill="#000000">
        <circle cx="38" cy="48" r="4.2" />
        <circle cx="62" cy="48" r="4.2" />
      </g>
      
      {/* Eye Glints */}
      <g fill="white">
        <circle cx="37" cy="46.5" r="1.5" />
        <circle cx="61" cy="46.5" r="1.5" />
      </g>

      {/* Open Mouth - Rounded Semicircle (Slightly further down for cuteness) */}
      <path 
        d="M 46 51 A 4 4 0 0 0 54 51 Z" 
        fill="#4f3b3d" 
        stroke="#3d3935" 
        strokeWidth="0.8"
      />

      {/* Blush - Smaller r=3 (was 4) */}
      <circle cx="28" cy="56" r="3" fill="#fb9fa4" opacity="0.9" />
      <circle cx="72" cy="56" r="3" fill="#fb9fa4" opacity="0.9" />
    </svg>
  );
}
