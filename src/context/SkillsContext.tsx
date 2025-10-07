// context/SkillsContext.tsx

"use client"; // Essential: This context uses state and localStorage.

import React, { createContext, useState, useEffect, useContext, ReactNode, Dispatch, SetStateAction } from 'react';

// Define individual item interfaces
interface ExperienceItem {
  company: string;
  role: string;
  // Add other relevant fields
}

interface EducationItem {
  school: string;
  degree: string;
  // Add other relevant fields
}

interface ProjectItem {
  name: string;
  description: string;
  // Add other relevant fields
}

interface CertificationItem {
  name: string;
  authority: string;
  // Add other relevant fields
}

// 1. Define the shape of your skills data
interface SkillsData {
  name: string;
  email: string;
  phone: string;
  skills: string[];
  experience: ExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
}

// 2. Define the shape of the context value
interface SkillsContextType {
  skills: SkillsData;
  setSkills: Dispatch<SetStateAction<SkillsData>>;
}

// 3. Create the context with a default value
const SkillsContext = createContext<SkillsContextType | undefined>(undefined);

// Define the default state for initialization
const initialSkillsState: SkillsData = {
  name: '',
  email: '',
  phone: '',
  skills: ['Corporate'],
  experience: [],
  education: [],
  projects: [],
  certifications: [],
};

// 4. Define the props for the provider component
interface SkillsProviderProps {
  children: ReactNode;
}

// 5. Create the SkillsProvider component
export const SkillsProvider: React.FC<SkillsProviderProps> = ({ children }) => {
  // Initialize state with a default object to prevent hydration errors.
  const [skills, setSkills] = useState<SkillsData>(initialSkillsState);

  // This useEffect will run once on the client to load data from localStorage.
  useEffect(() => {
    try {
      const savedSkills = localStorage.getItem('skills');
      if (savedSkills) {
        setSkills(JSON.parse(savedSkills));
      }
    } catch (error) {
      console.error("Failed to parse skills from localStorage", error);
    }
  }, []); // Empty dependency array ensures it runs only on mount.

  // This useEffect saves the skills to localStorage whenever they change.
  useEffect(() => {
    // Save skills to localStorage only if there is a name to avoid overwriting with initial state.
    if (skills.name) {
      localStorage.setItem('skills', JSON.stringify(skills));
    }
  }, [skills]);

  return (
    <SkillsContext.Provider value={{ skills, setSkills }}>
      {children}
    </SkillsContext.Provider>
  );
};

// 6. Create a custom hook for easy consumption of the context
export const useSkills = (): SkillsContextType => {
  const context = useContext(SkillsContext);
  if (context === undefined) {
    throw new Error('useSkills must be used within a SkillsProvider');
  }
  return context;
};