// components/course/ChatBubble.tsx
'use client';

import React from 'react';

interface ChatBubbleProps {
  message: {
    text: string;
    sender: 'user' | 'bot';
  };
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white'
        }`}
        dangerouslySetInnerHTML={{ __html: message.text }}
      />
    </div>
  );
};

export default ChatBubble;