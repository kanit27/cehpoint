// src/app/components/course/ChatDrawer.tsx
'use client';

import React from 'react';
import { IoSend } from 'react-icons/io5';
import { FiX } from 'react-icons/fi';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: { text: string; sender: 'bot' | 'user' }[];
  newMessage: string;
  setNewMessage: (value: string) => void;
  sendMessage: (e: React.FormEvent) => void;
  mainTopic: string;
}

const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  messages,
  newMessage,
  setNewMessage,
  sendMessage,
  mainTopic,
}) => {
  return (
    <div
      className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-black shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="font-bold text-lg dark:text-white">AI Assistant for {mainTopic}</h2>
          <button onClick={onClose}>
            <FiX size={24} className="dark:text-white" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  msg.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-800 text-black dark:text-white'
                }`}
                dangerouslySetInnerHTML={{ __html: msg.text }}
              />
            </div>
          ))}
        </div>
        <form className="flex p-4 border-t border-gray-200 dark:border-gray-800" onSubmit={sendMessage}>
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Ask anything..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-l-md bg-white dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-r-md flex items-center justify-center">
            <IoSend size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatDrawer;