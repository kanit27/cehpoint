// components/admin/DashboardCards.tsx
'use client';

import React from 'react';
import { FaUsers, FaVideo } from "react-icons/fa";

interface DashboardData {
  users?: number;
  courses?: number;
  // Add other properties from your API response here
}

interface DashboardCardsProps {
  datas: DashboardData;
  loading: boolean;
}

const DashboardCards: React.FC<DashboardCardsProps> = ({ datas, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className='flex flex-col'>
      <div className='my-4 flex flex-wrap items-center justify-center gap-4'>
        <div className="w-full sm:w-1/2 md:w-1/4 p-5 border border-black dark:border-white bg-white dark:bg-black rounded-lg">
          <h5 className='text-sm font-normal tracking-tight text-black dark:text-white'>
            Total Users
          </h5>
          <div className='flex flex-row items-center mt-2'>
            <FaUsers className='text-3xl text-black dark:text-white' />
            <p className='font-black text-2xl pl-3 text-black dark:text-white'>{datas.users || 0}</p>
          </div>
        </div>
        <div className="w-full sm:w-1/2 md:w-1/4 p-5 border border-black dark:border-white bg-white dark:bg-black rounded-lg">
          <h5 className='text-sm font-normal tracking-tight text-black dark:text-white'>
            Total Courses
          </h5>
          <div className='flex flex-row items-center mt-2'>
            <FaVideo className='text-3xl text-black dark:text-white' />
            <p className='font-black text-2xl pl-3 text-black dark:text-white'>{datas.courses || 0}</p>
          </div>
        </div>
        {/* You can add more cards here for other data points like 'frees', 'paids', etc. */}
      </div>
    </div>
  );
};

export default DashboardCards;