'use client';

import React from "react";
import Image from "next/image";
import Logo from "../assets/logo.svg";
import DarkLogo from "../assets/darkLogo.svg";

interface LogoComponentProps {
  isDarkMode?: boolean;
}

const LogoComponent: React.FC<LogoComponentProps> = ({ isDarkMode }) => (
  <Image
    src={isDarkMode ? DarkLogo : Logo}
    alt="Logo"
    height={32}
    className="h-8 w-auto"
    priority
  />
);

export default LogoComponent;