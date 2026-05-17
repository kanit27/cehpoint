'use client';

import React from 'react';
import { IoPerson, IoRocket } from 'react-icons/io5';

interface ChatBubbleProps {
  message: {
    text: string;
    sender: 'user' | 'bot';
  };
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex items-start gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${
        isUser
          ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
          : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
      }`}>
        {isUser ? <IoPerson size={16} /> : <IoRocket size={16} />}
      </div>
      <div
        className={`max-w-sm lg:max-w-lg px-3 py-2 rounded-2xl shadow-sm text-sm leading-relaxed ${
          isUser
            ? 'bg-blue-600 text-white rounded-tr-sm'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-sm border border-gray-200 dark:border-gray-700'
        }`}
        dangerouslySetInnerHTML={{ __html: message.text }}
      />
    </div>
  );
};

export default ChatBubble;