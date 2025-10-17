"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { mainname, subname, websiteURL } from "../../lib/constants";
import axiosInstance from "../../lib/axios";
import DarkModeToggle from "./DarkModeToggle";
import LogoComponent from "./LogoComponent";
import { useTheme } from "../../context/ThemeContext";
import { AiOutlineMenu } from "react-icons/ai";

interface UserProfileResponse {
  success: boolean;
  userProfile: {
    profile: string;
    role: string;
  };
}

interface HeaderProps {
  isHome?: boolean;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ isHome = false, className }) => {
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

  // Navigation handlers
  const redirect = (path: string) => router.push(path);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHome]);

  const fetchProfile = async (uid: string) => {
    try {
      const response = await axiosInstance.get(`/api/user/profile?uid=${uid}`);
      const data = response.data as UserProfileResponse;
      if (data.success) {
        setProfileImg(data.userProfile.profile);
        setIsAdmin(data.userProfile.role === "admin");
        sessionStorage.setItem("role", data.userProfile.role);
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

  // Toast helper
  const showToast = (msg: string) => {
    toast(msg, {
      position: "bottom-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  // Mobile menu links
  const mobileLinks = (
    <>
      <button onClick={() => redirect("/features")} className="font-medium dark:text-white text-black text-left w-full py-2">
        Features
      </button>
      {isLoggedIn && (
        <>
          <button onClick={() => redirect("/home")} className="font-medium dark:text-white text-black text-left w-full py-2">
            Home
          </button>
          <button onClick={() => redirect("/profile")} className="font-medium dark:text-white text-black text-left w-full py-2">
            Profile
          </button>
          <button onClick={() => redirect("/performance")} className="font-medium dark:text-white text-black text-left w-full py-2">
            Performance
          </button>
          <button onClick={() => redirect("/myproject")} className="font-medium dark:text-white text-black text-left w-full py-2">
            My Project
          </button>
          <button onClick={() => redirect("/create")} className="font-medium text-white bg-black dark:text-black dark:bg-white px-3 py-1 rounded-md text-left w-full">
            Generate Course
          </button>
          {isAdmin && (
            <button onClick={() => redirect("/project")} className="font-medium dark:text-white text-black text-left w-full py-2">
              Admin
            </button>
          )}
          <button onClick={handleLogout} className="font-medium dark:text-white text-black text-left w-full py-2">
            Logout
          </button>
        </>
      )}
      {!isLoggedIn && (
        <>
          <button onClick={() => redirect("/signin")} className="px-4 py-2 text-sm font-medium text-black dark:text-white border border-black dark:border-white rounded-md w-full text-left">
            SignIn
          </button>
          <button onClick={() => redirect("/signup")} className="px-4 py-2 text-sm font-medium text-white bg-black dark:text-black dark:bg-white rounded-md w-full text-left">
            SignUp
          </button>
        </>
      )}
    </>
  );

  return (
    <nav className={`w-full py-3 dark:bg-black bg-white border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 ${className || ""}`}>
      <div className="flex items-center gap-3">
        <Link href={isLoggedIn ? "/home" : "/"}>
          <span className="flex items-center gap-2 cursor-pointer">
            <LogoComponent isDarkMode={theme} />
            <span className="flex flex-col">
              <h1 className="font-black text-2xl dark:text-white">{mainname}</h1>
              <em className="text-sm font-semibold dark:text-white">{subname}</em>
            </span>
          </span>
        </Link>
      </div>
      <div className="flex items-center gap-5">
        <DarkModeToggle />
        <div className="hidden md:flex items-center gap-4">
          <button onClick={() => redirect("/features")} className="font-medium dark:text-white text-black">
            Features
          </button>
          {isLoggedIn && (
            <>
              <button onClick={() => redirect("/home")} className="font-medium dark:text-white text-black">
                Home
              </button>
              <button onClick={() => redirect("/profile")} className="font-medium dark:text-white text-black">
                Profile
              </button>
              <button onClick={() => redirect("/performance")} className="font-medium dark:text-white text-black">
                Performance
              </button>
              <button onClick={() => redirect("/myproject")} className="font-medium dark:text-white text-black">
                My Project
              </button>
              <button onClick={() => redirect("/create")} className="font-medium text-white bg-black dark:text-black dark:bg-white px-3 py-1 rounded-md">
                Generate Course
              </button>
              {isAdmin && (
                <button onClick={() => redirect("/project")} className="font-medium dark:text-white text-black">
                  Admin
                </button>
              )}
              <button onClick={handleLogout} className="font-medium dark:text-white text-black">
                Logout
              </button>
            </>
          )}
        </div>
        {isLoggedIn ? (
          <div className="relative">
            
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded shadow-lg z-50">
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="block text-sm dark:text-white text-black">{userName}</span>
                  <span className="block truncate text-xs font-medium dark:text-white text-black">{userEmail}</span>
                </div>
                <button onClick={() => redirect("/home")} className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-white text-black w-full text-left">
                  Home
                </button>
                <button onClick={() => redirect("/profile")} className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-white text-black w-full text-left">
                  Profile
                </button>
                <button onClick={() => redirect("/performance")} className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-white text-black w-full text-left">
                  Performance
                </button>
                <button onClick={() => redirect("/myproject")} className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-white text-black w-full text-left">
                  My Project
                </button>
                <button onClick={() => redirect("/create")} className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-white text-black w-full text-left">
                  Generate Course
                </button>
                {isAdmin && (
                  <button onClick={() => redirect("/project")} className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-white text-black w-full text-left">
                    Admin
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-white text-black"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => redirect("/signin")} className="px-4 py-2 text-sm font-medium text-black dark:text-white border border-black dark:border-white rounded-md">
              SignIn
            </button>
            <button onClick={() => redirect("/signup")} className="px-4 py-2 text-sm font-medium text-white bg-black dark:text-black dark:bg-white rounded-md">
              SignUp
            </button>
          </div>
        )}
        <button
          className="md:hidden flex items-center px-2 py-1 border rounded"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <AiOutlineMenu />
        </button>
      </div>
      {menuOpen && (
        <div className="absolute top-16 right-4 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded shadow-lg z-50 flex flex-col gap-2 p-4 md:hidden min-w-[180px]">
          {mobileLinks}
        </div>
      )}
    </nav>
  );
};

export default Header;