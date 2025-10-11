// src/app/components/course/CircularProgressBar.tsx
'use client';

import React from 'react';

interface CircularProgressBarProps {
  percentage: number;
  isDarkMode: boolean;
}

const CircularProgressBar: React.FC<CircularProgressBarProps> = ({ percentage, isDarkMode }) => {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="w-10 h-10 relative">
      <svg className="w-full h-full" viewBox="0 0 50 50">
        <circle
          className={isDarkMode ? "text-gray-700" : "text-gray-200"}
          strokeWidth="5"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="25"
          cy="25"
        />
        <circle
          className={isDarkMode ? "text-white" : "text-black"}
          strokeWidth="5"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="25"
          cy="25"
          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
        />
      </svg>
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-bold">
        {`${percentage}%`}
      </span>
    </div>
  );
};

export default CircularProgressBar;