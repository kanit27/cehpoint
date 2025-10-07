'use client';

import React from "react";
import Image from 'next/image';

import Logo from "../assets/logo.svg";
import DarkLogo from "../assets/darkLogo.svg";
import { useTheme } from '../../context/ThemeContext';

interface ThemeContextType {
  theme: boolean;
  toggleTheme: () => void;
}

const LogoComponent: React.FC = () => {
  const { theme } = useTheme() as ThemeContextType;

  return (
    <Image
      alt="logo"
      src={theme ? DarkLogo : Logo}
      height={36}
      width={120}
      className="mr-3"
      priority
    />
  );
};

export default LogoComponent;