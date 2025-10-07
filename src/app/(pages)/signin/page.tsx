"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

import { mainname, subname, websiteURL } from "../../../lib/constants";
import DarkModeToggle from "../../components/DarkModeToggle";
// import LogoComponent from "../../components/LogoComponent";
import GoogleSignUpButton from "../../components/GoogleSignUpButton";
import axiosInstance from "../../../lib/axios";
import img from "../../assets/signin.svg";

interface SignInResponse {
  success: boolean;
  message: string;
  userData: Record<string, string>;
}
const SignInPage: React.FC = () => {
  const auth = getAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [processing, setProcessing] = useState(false);
  const [storedTheme, setStoredTheme] = useState<string | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem("auth")) {
      router.push("/home");
    }
    setStoredTheme(sessionStorage.getItem("darkMode"));
  }, [router]);

  const showToast = (msg: string) => {
    setProcessing(false);
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

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast("Please fill in all required fields");
      return;
    }

    try {
      setProcessing(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const firebaseUid = user.uid;


      const res = await axiosInstance.post(`/signin`, { email, password, firebaseUid });

      const data = res.data as SignInResponse;

      if (data.success) {
        showToast(data.message);
        Object.keys(data.userData).forEach(key => {
          sessionStorage.setItem(key, data.userData[key] || '');
        });
        sessionStorage.setItem("auth", "true");
        router.push("/home");
      } else {
        showToast(data.message);
      }
    } catch (error) {
      showToast("Sign-in failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <div className="flex h-screen dark:bg-black no-scrollbar">
        <div className="flex-1 overflow-y-auto no-scrollbar overflow-x-hidden">
          {/* Navbar */}
          <nav className="flex items-center justify-between p-8 dark:bg-black">
            <Link href={websiteURL} className="ml-1 flex items-center">
              {/* <LogoComponent isDarkMode={storedTheme} /> */}
              <span className="self-center whitespace-nowrap text-2xl flex items-start justify-center flex-col font-black dark:text-white">
                <h1 className="font-black">{mainname}</h1>
                <em className="text-sm font-semibold">{subname}</em>
              </span>
            </Link>
            <DarkModeToggle />
          </nav>

          <form onSubmit={handleSignin} className="max-w-sm m-auto py-9 no-scrollbar">
            <h1 className="text-center font-black text-5xl text-black dark:text-white">
              SignIn
            </h1>
            <p className="text-center font-normal text-red-600 py-4 dark:text-red-400 animate-pulse">
              Email and password login is temporarily unavailable.
            </p>
            <div className="py-5 max-md:px-10">
              {/* Email input */}
              <div className="mb-6">
                <label className="font-bold text-black dark:text-white block mb-2" htmlFor="email1">
                  Email
                </label>
                <input
                  onChange={(e) => setEmail(e.target.value)}
                  id="email1"
                  type="email"
                  disabled={true}
                  className="focus:ring-black focus:border-black border border-black font-normal bg-white rounded-none block w-full dark:bg-black dark:border-white dark:text-white"
                />
              </div>
              {/* Password input */}
              <div className="mb-4">
                <label className="font-bold text-black dark:text-white block mb-2" htmlFor="password">
                  Password
                </label>
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  id="password"
                  type="password"
                  disabled={true}
                  className="focus:ring-black focus:border-black border border-black font-normal bg-white rounded-none block w-full dark:bg-black dark:border-white dark:text-white"
                />
              </div>

              <div className="flex items-center mb-7">
                <Link href="/forgot" className="text-center font-normal text-black underline dark:text-white">
                  Forgot Password ?
                </Link>
              </div>

              <button
                type="submit"
                disabled={true}
                className="items-center justify-center text-center dark:bg-white dark:text-black bg-black text-white font-bold rounded-none w-full hover:bg-black focus:bg-black focus:ring-transparent dark:hover:bg-white dark:focus:bg-white dark:focus:ring-transparent py-2"
              >
                Submit
              </button>

              <div className="text-center pt-5">
                <GoogleSignUpButton text="Sign in with Google" showToast={showToast} />
              </div>

              <p className="text-center font-normal py-4 dark:text-white">
                Don't have an account? <Link href="/signup" className="underline">SignUp</Link>
              </p>
            </div>
          </form>
        </div>
        <div className="flex-1 hidden lg:flex items-center justify-center bg-gray-50 dark:bg-white">
          <Image src={img} className="h-full bg-cover bg-center p-9" alt="Sign In illustration" priority />
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default SignInPage;