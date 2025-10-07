// components/admin/AdminHead.tsx
'use client';

import React from "react";

const AdminHead: React.FC = () => {
  return (
    <header className="py-5 px-4 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
      <p className="font-black text-xl dark:text-white">Dashboard</p>
    </header>
  );
};

export default AdminHead;