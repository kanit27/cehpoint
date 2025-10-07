// components/ToastProvider.tsx

"use client";

import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ToastProvider() {
  const [theme, setTheme] = useState("light");

  // This useEffect safely reads from sessionStorage only on the client
  useEffect(() => {
    const storedTheme = sessionStorage.getItem("darkMode");
    setTheme(storedTheme === "true" ? "dark" : "light");
  }, []);

  return (
    <ToastContainer
      limit={3}
      progressClassName={theme === "dark" ? "toastProgressDark" : "toastProgress"}
      className={theme === "dark" ? "toastBodyDark" : "toastBody"}
      position="bottom-center"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={theme}
    />
  );
}