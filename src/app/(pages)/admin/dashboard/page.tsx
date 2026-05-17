// app/admin/dashboard/page.tsx
'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import AdminHead from "../../../components/admin/AdminHead";
import DashboardCards from "../../../components/admin/DashboardCards";
import axiosInstance from "../../../../lib/axios";
import { toast } from "react-toastify";

interface ProfileResponse {
  success: boolean;
  userProfile: { role: string };
}

interface DashboardData {
  users?: number;
  courses?: number;
  projects?: number;
  quizResults?: number;
}

const DashboardPage: React.FC = () => {
  const router = useRouter();
  const [data, setData] = useState<DashboardData>({});
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    async function checkRole() {
      const role = sessionStorage.getItem("role");
      if (role === "admin") {
        setAuthorized(true);
        return;
      }
      const uid = sessionStorage.getItem("uid");
      if (uid) {
        try {
          const res = await axiosInstance.get<ProfileResponse>(`/api/user/profile?uid=${uid}`);
          const userRole = res.data?.userProfile?.role;
          if (userRole === "admin") {
            sessionStorage.setItem("role", "admin");
            setAuthorized(true);
            return;
          }
        } catch {
          // ignore
        }
      }
      router.push("/home");
    }
    checkRole();
  }, [router]);

  useEffect(() => {
    if (!authorized) return;
    async function dashboardData() {
      try {
        const response = await axiosInstance.post<DashboardData>(`/api/dashboard`);
        setData(response.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }
    dashboardData();
  }, [authorized]);

  const handleInputSubmit = async () => {
    try {
      const response = await axiosInstance.post('/api/key', { key: inputValue });
      toast.success("API key updated for all users.");
      setInputValue('');
    } catch (error) {
      console.log(error);
      toast.error("Failed to update API key.");
    }
  };

  if (!authorized) return null;

  return (
    <div className="flex h-screen bg-white dark:bg-black">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <AdminHead />
        <main className="p-4">
          <DashboardCards datas={data} loading={loading} />
          <div className="mt-8 p-4">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">
                Change API Key for All Users
              </h2>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter the new Gemini API key here"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 dark:bg-gray-700 dark:border-gray-600"
              />
              <button
                onClick={handleInputSubmit}
                className="px-5 py-2 bg-black text-white rounded-md hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                Submit Key
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;