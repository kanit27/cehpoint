'use client';

import React from "react";
import Image from "next/image";
import Logo from "../assets/logo.svg";
import DarkLogo from "../assets/darkLogo.svg";

interface LogoComponentProps {
  isDarkMode?: boolean;
}

const LogoComponent: React.FC<LogoComponentProps> = ({ isDarkMode }) => {
  // detect SVGR-produced component vs image URL
  const isComponent = typeof (Logo as any) === "function";

  if (isComponent) {
    const Svg = isDarkMode ? (DarkLogo as any) : (Logo as any);
    return <Svg className="h-8 w-auto" aria-hidden="true" />;
  }

  // fallback: treat imports as URLs (string)
  const src = isDarkMode ? (DarkLogo as unknown as string) : (Logo as unknown as string);
  return <Image src={src} alt="Logo" height={32} className="h-8 w-auto" priority />;
};

export default LogoComponent;