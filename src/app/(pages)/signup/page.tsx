// app/pages/Signup.tsx
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { AiOutlineLoading } from "react-icons/ai";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";

import { mainname, subname, websiteURL, name as appName, company } from "../../../lib/constants";
// import DarkModeToggle from "../../components/DarkModeToggle";
// import LogoComponent from "../../components/LogoComponent";
import GoogleSignUpButton from "../../components/GoogleSignUpButton";
import axiosInstance from "../../../lib/axios";
import img from "../../assets/signup.svg";

const SignUpPage: React.FC = () => {
  const auth = getAuth();
  const router = useRouter();

  const [mName, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [processing, setProcessing] = useState(false);
  const [storedTheme, setStoredTheme] = useState<string | null>(null);
  const [profile] = useState(
    "https://firebasestorage.googleapis.com/v0/b/ai-based-training-platfo-ca895.appspot.com/o/user.png?alt=media&token=cdde4ad1-26e7-4edb-9f7b-a3172fbada8d"
  );

  useEffect(() => {
    if (sessionStorage.getItem("auth")) {
      router.push("/home");
    }
    setStoredTheme(sessionStorage.getItem("darkMode"));
  }, [router]);

  const showToast = (msg: string) => {
    setProcessing(false);
    toast(msg, { position: "bottom-center", autoClose: 3000 });
  };

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mName || !email || !password) {
      return showToast("Please fill in all required fields");
    }
    if (password.length < 9) {
      return showToast("Password should be at least 9 characters");
    }
    if (!validateEmail(email)) {
      return showToast("Please enter a valid email address");
    }

    try {
      setProcessing(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const response = await axiosInstance.post(`/signup`, {
        email,
        mName,
        password,
        type: "free",
        uid: user.uid,
        profile,
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        unsplashApiKey: process.env.NEXT_PUBLIC_UNSPLASH_API_KEY,
      });

      const data = response.data as { success: boolean; message: string };
      if (data.success) {
        showToast(data.message);
        sessionStorage.setItem("email", email);
        sessionStorage.setItem("mName", mName);
        sessionStorage.setItem("auth", "true");
        sessionStorage.setItem("uid", user.uid);
        sessionStorage.setItem("type", "free");
        await sendEmail(email, mName);
        router.push("/home");
      } else {
        showToast(data.message);
      }
    } catch (error) {
      showToast("Signup failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  async function sendEmail(mEmail: string, mName: string) {
    const emailHtml = `...`; // Your HTML email template
    try {
      await axiosInstance.post(`/data`, {
        subject: `Welcome to ${appName}`,
        to: mEmail,
        html: emailHtml,
      });
    } catch (error) {
      console.error("Failed to send welcome email", error);
    }
  }

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <div className="flex h-screen dark:bg-black no-scrollbar overflow-x-hidden">
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {/* Navbar */}
          <nav className="flex items-center justify-between p-8 dark:bg-black">
            <Link href={websiteURL} className="flex items-center">
              {/* <LogoComponent isDarkMode={storedTheme} /> */}
              <span className="self-center whitespace-nowrap text-2xl flex items-start justify-center flex-col font-black dark:text-white ">
                <h1 className="font-black">{mainname}</h1>
                <em className="text-sm font-semibold">{subname}</em>
              </span>
            </Link>
            {/* <DarkModeToggle /> */}
          </nav>

          <form onSubmit={handleSignup} className="max-w-sm m-auto py-4 no-scrollbar">
            <h1 className="text-center font-black text-5xl text-black dark:text-white">
              SignUp
            </h1>
            <p className="text-center font-normal text-red-600 py-4 dark:text-red-400 animate-pulse">
              Email and password signup is temporarily unavailable.
            </p>

            <div className="py-6 max-md:px-10">
              {/* Name Input */}
              <div className="mb-6">
                <label className="font-bold text-black dark:text-white block mb-2" htmlFor="name1">
                  Name
                </label>
                <input
                  value={mName}
                  onChange={(e) => setName(e.target.value)}
                  id="name1"
                  type="text"
                  disabled={true}
                  className="focus:ring-black focus:border-black border border-black font-normal bg-white rounded-none block w-full dark:bg-black dark:border-white dark:text-white"
                />
              </div>
              {/* Email Input */}
              <div className="mb-6">
                <label className="font-bold text-black dark:text-white block mb-2" htmlFor="email1">
                  Email
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  id="email1"
                  type="email"
                  disabled={true}
                  className="focus:ring-black focus:border-black border border-black font-normal bg-white rounded-none block w-full dark:bg-black dark:border-white dark:text-white"
                />
              </div>
              {/* Password Input */}
              <div className="mb-7">
                <label className="font-bold text-black dark:text-white block mb-2" htmlFor="password">
                  Password
                </label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  id="password"
                  type="password"
                  disabled={true}
                  className="focus:ring-black focus:border-black border border-black font-normal bg-white rounded-none block w-full dark:bg-black dark:border-white dark:text-white"
                />
              </div>
              <div className="mb-4">
                <button
                  type="submit"
                  disabled={true}
                  className="flex items-center justify-center text-center dark:bg-white dark:text-black bg-black text-white font-bold rounded-none w-full hover:bg-black focus:bg-black focus:ring-transparent dark:hover:bg-white dark:focus:bg-white dark:focus:ring-transparent py-2"
                >
                  {processing ? (
                    <AiOutlineLoading className="h-6 w-6 animate-spin mr-2" />
                  ) : null}
                  Submit
                </button>
              </div>
              <GoogleSignUpButton text="Sign up with Google" showToast={showToast} />
              <p className="text-center font-normal text-black underline pt-4 dark:text-white">
                Already have an account ? <Link href="/signin" className="underline">SignIn</Link>
              </p>
            </div>
          </form>
        </div>

        <div className="flex-1 hidden lg:flex items-center justify-center bg-gray-50 dark:bg-white">
          <Image src={img} className="h-full bg-cover bg-center p-9" alt="Sign Up illustration" priority />
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default SignUpPage;