"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { mainname, subname } from "../../lib/constants";
import axiosInstance from "../../lib/axios";
import DarkModeToggle from "../components/DarkModeToggle";
import LogoComponent from "../components/LogoComponent";
import { useTheme } from "../../context/ThemeContext";

interface HeaderProps {
  isHome: boolean;
}

const Header: React.FC<HeaderProps> = ({ isHome }) => {
  const router = useRouter();
  const { theme } = useTheme();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profileImg, setProfileImg] = useState(
    "https://firebasestorage.googleapis.com/v0/b/ai-based-training-platfo-ca895.appspot.com/o/user.png?alt=media&token=cdde4ad1-26e7-4edb-9f7b-a3172fbada8d"
  );
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const uid = sessionStorage.getItem("uid");
    const name = sessionStorage.getItem("mName");
    const email = sessionStorage.getItem("email");

    if (uid) {
      setIsLoggedIn(true);
      setUserName(name || "");
      setUserEmail(email || "");
      fetchProfile(uid);
    } else if (isHome) {
      router.push("/signin");
    }
  }, [isHome, router]);

  const fetchProfile = async (uid: string) => {
    try {
      const response = await axiosInstance.get(`/api/user/profile?uid=${uid}`);
      if (response.data.success) {
        setProfileImg(response.data.userProfile.profile);
        setIsAdmin(response.data.userProfile.role === "admin");
        sessionStorage.setItem("role", response.data.userProfile.role);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    toast.success("Logout Successful");
    router.push("/signin");
  };

  return (
    <nav className="w-full py-3 dark:bg-black bg-white border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <Link href={isLoggedIn ? "/home" : "/"}>
          <span className="flex items-center gap-2">
            <LogoComponent isDarkMode={theme} />
            <span className="flex flex-col">
              <h1 className="font-black text-2xl dark:text-white">{mainname}</h1>
              <em className="text-sm font-semibold dark:text-white">{subname}</em>
            </span>
          </span>
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-4">
          <Link href="/features" className="font-medium dark:text-white text-black">Features</Link>
          {isLoggedIn && (
            <>
              <Link href="/my-projects" className="font-medium dark:text-white text-black">My Projects</Link>
              <Link href="/create" className="font-medium text-white bg-black dark:text-black dark:bg-white px-3 py-1 rounded-md">Generate Course</Link>
            </>
          )}
        </div>
        {isLoggedIn ? (
          <div className="relative">
            <button
              className="flex items-center gap-2 focus:outline-none"
              onClick={() => setDropdownOpen((prev) => !prev)}
            >
              <Image
                src={profileImg}
                alt="User"
                width={36}
                height={36}
                className="rounded-full border"
              />
              <span className="hidden md:block font-medium dark:text-white text-black">{userName}</span>
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded shadow-lg z-50">
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="block text-sm dark:text-white text-black">{userName}</span>
                  <span className="block truncate text-xs font-medium dark:text-white text-black">{userEmail}</span>
                </div>
                <Link href="/admin/dashboard" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-white text-black">Dashboard</Link>
                <Link href="/profile" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-white text-black">Profile</Link>
                {isAdmin && (
                  <Link href="/project" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-white text-black">Admin Panel</Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-white text-black"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex gap-2">
            <Link href="/signin" className="px-4 py-2 text-sm font-medium text-black dark:text-white border border-black dark:border-white rounded-md">
              SignIn
            </Link>
            <Link href="/signup" className="px-4 py-2 text-sm font-medium text-white bg-black dark:text-black dark:bg-white rounded-md">
              SignUp
            </Link>
          </div>
        )}
        <DarkModeToggle />
        <button
          className="md:hidden flex items-center px-2 py-1 border rounded"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span className="material-icons">menu</span>
        </button>
      </div>
      {menuOpen && (
        <div className="absolute top-16 right-4 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded shadow-lg z-50 flex flex-col gap-2 p-4 md:hidden">
          <Link href="/features" className="font-medium dark:text-white text-black">Features</Link>
          {isLoggedIn && (
            <>
              <Link href="/my-projects" className="font-medium dark:text-white text-black">My Projects</Link>
              <Link href="/create" className="font-medium text-white bg-black dark:text-black dark:bg-white px-3 py-1 rounded-md">Generate Course</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Header;