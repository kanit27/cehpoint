// components/admin/AdminSidebar.tsx
'use client';

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaUsers, FaVideo, FaCog, FaFileAlt, FaProjectDiagram, FaTachometerAlt } from "react-icons/fa";

const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const linkItems = [
    { label: "Dashboard", icon: <FaTachometerAlt />, path: "/admin/dashboard" },
    { label: "Projects", icon: <FaProjectDiagram />, path: "/admin/project" },
    { label: "Users", icon: <FaUsers />, path: "/admin/users" },
    { label: "Courses", icon: <FaVideo />, path: "/admin/courses" },
    { label: "Admins", icon: <FaCog />, path: "/admin/admins" },
    { label: "Terms", icon: <FaFileAlt />, path: "/admin/editterms" },
    { label: "Privacy", icon: <FaFileAlt />, path: "/admin/editprivacy" },
  ];

  return (
    <aside className="w-64 h-full bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 p-4">
      <h1 className="text-2xl font-black mb-8 dark:text-white">Admin Panel</h1>
      <nav className="flex flex-col space-y-2">
        {linkItems.map((item) => (
          <Link
            key={item.label}
            href={item.path}
            className={`flex items-center p-2 rounded-md transition-colors ${
              pathname === item.path
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-white"
            }`}
          >
            <span className="mr-3">{item.icon}</span>
            <span className="font-bold">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;