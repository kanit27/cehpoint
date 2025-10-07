// components/DarkModeToggle.tsx

'use client';

import React from 'react';
import { HiSun, HiMoon } from "react-icons/hi";
import { useTheme } from '../../context/ThemeContext';

// Define an interface for the shape of your theme context's value
interface ThemeContextType {
  theme: boolean; // true for dark, false for light
  toggleTheme: () => void;
}

const DarkModeToggle: React.FC = () => {
    // Use a type assertion to inform TypeScript about the shape of useTheme's return value
    const { theme, toggleTheme } = useTheme() as ThemeContextType;

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full dark:text-white text-black"
            aria-label="Toggle dark mode"
        >
            {/* Renders the moon icon for dark mode, sun icon for light mode */}
            {theme ? <HiMoon size={20} /> : <HiSun size={20} />}
        </button>
    );
};

export default DarkModeToggle;