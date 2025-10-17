// src/app/components/course/CourseSidebar.tsx
"use client";

import React, { useState, useEffect } from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { FaCheck } from "react-icons/fa";
import Link from "next/link";
import { mainname, subname } from "@/lib/constants";
import LogoComponent from "../LogoComponent";
import { useTheme } from "../../../context/ThemeContext";

interface CourseSidebarProps {
  topics: any[];
  mainTopic: string;
  onSelectSubtopic: (topicTitle: string, subtopicTitle: string) => void;
  onShowQuiz: () => void;
  onShowProjects: () => void;
  activeSubtopic: string | null;
  showOnMobile?: boolean; // new prop to allow showing sidebar inside mobile off-canvas
}

const CourseSidebar: React.FC<CourseSidebarProps> = ({
  topics,
  mainTopic,
  onSelectSubtopic,
  onShowQuiz,
  onShowProjects,
  activeSubtopic,
  showOnMobile = false, // default: hidden on mobile unless explicitly requested
}) => {
  const [openTopic, setOpenTopic] = useState<string | null>(null);

  useEffect(() => {
    if (topics && topics.length > 0) {
      setOpenTopic((prev) => prev ?? topics[0].title);
    }
  }, [topics]);

  const handleToggleTopic = (topicTitle: string) => {
    setOpenTopic(openTopic === topicTitle ? null : topicTitle);
  };

  const { theme } = useTheme();
  const isLoggedIn = true;

  // visible on desktop always; on mobile visible only if showOnMobile === true
  const rootClass = `${showOnMobile ? "flex" : "hidden md:flex"} md:w-72 h-full md:h-screen flex-shrink-0 bg-white dark:bg-black p-4 border-r border-gray-200 dark:border-gray-800 flex-col md:sticky md:top-0`;

  return (
    <aside
      className={rootClass}
      role="navigation"
      aria-label={`${mainTopic} topics`}
    >
      <div className="flex items-center gap-3">
        <Link href={isLoggedIn ? "/home" : "/"}>
          <span className="flex items-center gap-2 cursor-pointer">
            <LogoComponent isDarkMode={theme} />
            <span className="flex flex-col">
              <h1 className="font-black text-2xl dark:text-white">{mainname}</h1>
              <em className="text-sm font-semibold dark:text-white">{subname}</em>
            </span>
          </span>
        </Link>
      </div>

      <div className="overflow-y-auto mt-4 no-scrollbar flex-1">
        {topics.map((topic) => (
          <div key={topic.title} className="mb-2">
            <button
              onClick={() => handleToggleTopic(topic.title)}
              className="flex justify-between items-center w-full py-2 text-left font-bold text-black dark:text-white"
              aria-expanded={openTopic === topic.title}
              aria-controls={`topic-${topic.title}`}
            >
              <span className="w-[90%] truncate">{topic.title}</span>
              {openTopic === topic.title ? <IoIosArrowUp /> : <IoIosArrowDown />}
            </button>

            {openTopic === topic.title && (
              <div
                id={`topic-${topic.title}`}
                className="pl-2 mt-1 border-l-[1px] border-gray-200 dark:border-gray-700"
              >
                {topic.subtopics.map((subtopic: any) => (
                  <button
                    key={subtopic.title}
                    onClick={() => onSelectSubtopic(topic.title, subtopic.title)}
                    className={`flex justify-between w-full py-2 text-sm text-left rounded-md px-2 transition-colors duration-150 ${
                      activeSubtopic === subtopic.title
                        ? "bg-blue-500 text-white"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <span className="w-[90%] truncate">{subtopic.title}</span>
                    {subtopic.done && <FaCheck className="h-3 w-auto text-blue-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
        <button
          onClick={onShowQuiz}
          className="w-full text-center py-2 font-bold text-white bg-gray-900 rounded-lg flex items-center justify-center gap-2"
        >
          Take Quiz
          <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse" />
        </button>
        <button
          onClick={onShowProjects}
          className="w-full text-center py-2 font-bold text-white bg-gray-900 rounded-lg"
        >
          Projects
        </button>
      </div>
    </aside>
  );
};

export default CourseSidebar;
