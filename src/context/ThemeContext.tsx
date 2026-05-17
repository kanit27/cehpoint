// context/ThemeContext.tsx

"use client"; // This is essential for any context that uses state or browser APIs.

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

// 1. Define the shape of the context value
interface ThemeContextType {
  theme: boolean;
  toggleTheme: () => void;
}

// 2. Create the context with a default value (or null)
const ThemeContext = createContext<ThemeContextType | null>(null);

// 3. Define the props for the provider component
interface ThemeProviderProps {
  children: ReactNode;
}

// 4. Create the ThemeProvider component
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Initialize theme to a default value to prevent hydration mismatch
  const [theme, setTheme] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Initialize theme from sessionStorage or system preference on mount
    const stored = sessionStorage.getItem("darkMode");
    if (stored !== null) {
      setTheme(stored === "true");
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme(true);
    }
  }, []);

  useEffect(() => {
    // Keep in sync with sessionStorage and html class
    if (theme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    sessionStorage.setItem('darkMode', String(theme));
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 5. Create the custom hook to consume the context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
