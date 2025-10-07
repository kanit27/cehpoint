// components/Footers.tsx

"use client";

import React from "react";
import Link from "next/link";
import Logo from "../assets/logo.svg";
import DarkLogo from "../assets/darkLogo.svg";
import { company, websiteURL } from "../../lib/constants";
import { useTheme } from "../../context/ThemeContext";

interface FootersProps {}

const Footers: React.FC<FootersProps> = () => {
  const { theme } = useTheme();

  return (
    <footer className="shadow-none rounded-none dark:bg-black w-full text-center">
      <div className="w-full flex items-center justify-between py-4">
        <a href={websiteURL} className="flex items-center justify-center">
          <img
            src={theme ? DarkLogo : Logo}
            alt="Logo"
            className="h-8"
          />
        </a>
        <div className="text-xs flex items-start justify-end -mt-3 font-semibold">
          <span className="flex items-start max-sm:flex-col justify-center gap-y-2">
            <Link href="/about" className="text-black font-bold mx-4 dark:text-white">
              About
            </Link>
            <Link href="/privacy" className="text-black font-bold mx-4 dark:text-white">
              Privacy Policy
            </Link>
          </span>
          <span className="flex items-start max-sm:flex-col justify-center gap-y-2">
            <Link href="/terms" className="text-black font-bold mx-4 dark:text-white">
              Terms
            </Link>
            <Link href="/contact" className="text-black font-bold mx-4 dark:text-white">
              Contact
            </Link>
          </span>
        </div>
      </div>
      <hr className="border-t border-black dark:border-white my-4" />
      <div className="text-black dark:text-white text-xs font-semibold pb-4">
        &copy; {2024} <a href={websiteURL} className="hover:underline">{company}</a>
      </div>
    </footer>
  );
};

export default Footers;