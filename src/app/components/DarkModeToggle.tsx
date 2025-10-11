// components/DarkModeToggle.tsx

'use client';

import React from 'react';
import { HiSun, HiMoon } from "react-icons/hi";
import { useTheme } from '../../context/ThemeContext';

const DarkModeToggle: React.FC<{ className?: string }> = ({ className }) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={`p-2 rounded-full dark:text-white text-black ${className || ""}`}
            aria-label="Toggle dark mode"
        >
            {theme ? <HiMoon size={20} /> : <HiSun size={20} />}
        </button>
    );
};

export default DarkModeToggle;