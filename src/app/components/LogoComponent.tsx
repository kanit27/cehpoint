'use client';

import React, { ComponentType, SVGProps } from "react";
import Image from "next/image";
import Logo from "../assets/logo.svg";
import DarkLogo from "../assets/darkLogo.svg";

interface LogoComponentProps {
  isDarkMode?: boolean;
}

type SvgComponent = ComponentType<SVGProps<SVGSVGElement>>;

const isSvgComponent = (mod: unknown): mod is SvgComponent =>
  typeof mod === "function";

const LogoComponent: React.FC<LogoComponentProps> = ({ isDarkMode }) => {
  const Svg = (isDarkMode ? DarkLogo : Logo) as SvgComponent;

  if (isSvgComponent(Svg)) {
    return <Svg className="h-8 w-auto" aria-hidden="true" width={32} height={32} />;
  }

  const src = (isDarkMode ? DarkLogo : Logo) as string;
  return <Image src={src} alt="Logo" width={32} height={32} className="h-8 w-auto" priority />;
};

export default LogoComponent;