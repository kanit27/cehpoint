// src/app/components/course/CourseSidebar.tsx
'use client';

import React, { useState } from 'react';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { FaCheck } from 'react-icons/fa';
import Link from 'next/link';
import { mainname, subname } from '@/lib/constants';

interface CourseSidebarProps {
  topics: any[];
  mainTopic: string;
  onSelectSubtopic: (topicTitle: string, subtopicTitle: string) => void;
  onShowQuiz: () => void;
  onShowProjects: () => void;
  activeSubtopic: string | null;
}

const CourseSidebar: React.FC<CourseSidebarProps> = ({
  topics,
  mainTopic,
  onSelectSubtopic,
  onShowQuiz,
  onShowProjects,
  activeSubtopic,
}) => {
  const [openTopic, setOpenTopic] = useState<string | null>(topics.length > 0 ? topics[0].title : null);

  const handleToggleTopic = (topicTitle: string) => {
    setOpenTopic(openTopic === topicTitle ? null : topicTitle);
  };

  return (
    // UPDATED: Added 'sticky' and 'top-0' classes
    <aside className="w-72 h-screen flex-shrink-0 bg-white dark:bg-black p-4 border-r border-gray-200 dark:border-gray-800 flex-col hidden md:flex sticky top-0">
      
      <div className="overflow-y-auto no-scrollbar flex-1">
        {topics.map((topic) => (
          <div key={topic.title} className="mb-2">
            <button
              onClick={() => handleToggleTopic(topic.title)}
              className="flex justify-between items-center w-full py-2 text-left font-bold text-black dark:text-white"
            >
              <span className="w-[90%]">{topic.title}</span>
              {openTopic === topic.title ? <IoIosArrowUp /> : <IoIosArrowDown />}
            </button>
            {openTopic === topic.title && (
              <div className="pl-4 mt-1 border-l-2 border-gray-200 dark:border-gray-700">
                {topic.subtopics.map((subtopic: any) => (
                  <button
                    key={subtopic.title}
                    onClick={() => onSelectSubtopic(topic.title, subtopic.title)}
                    className={`flex justify-between w-full py-2 text-sm text-left rounded-md px-2 ${
                      activeSubtopic === subtopic.title
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span className="w-[90%]">{subtopic.title}</span>
                    {subtopic.done && <FaCheck className="h-3 w-auto text-green-500" />}
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
          <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
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