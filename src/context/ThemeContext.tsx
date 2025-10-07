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
  // Initialize state to a default (e.g., false), and load from sessionStorage in a useEffect.
  // This prevents server/client mismatch errors (hydration errors).
  const [theme, setTheme] = useState(false);

  // Effect to load the theme from sessionStorage once the component mounts on the client
  useEffect(() => {
    const storedTheme = sessionStorage.getItem('darkMode');
    setTheme(storedTheme === 'true');
  }, []); // Empty dependency array ensures this runs only once on mount

  // Effect to apply the theme to the HTML tag and save to sessionStorage
  useEffect(() => {
    if (theme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    sessionStorage.setItem('darkMode', String(theme));
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => !prevTheme);
  };

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