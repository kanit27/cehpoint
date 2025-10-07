'use client';

import React from "react";
import Logo from "../assets/logo.svg";
import DarkLogo from "../assets/darkLogo.svg";

interface LogoComponentProps {
  isDarkMode?: boolean;
}

const LogoComponent: React.FC<LogoComponentProps> = ({ isDarkMode }) => (
  <img
    src={isDarkMode ? DarkLogo : Logo}
    alt="Logo"
    className="h-8"
  />
);

export default LogoComponent;