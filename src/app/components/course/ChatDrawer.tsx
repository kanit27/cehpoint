// components/course/ChatDrawer.tsx
'use client';

import React from 'react';
import { IoSend, IoClose } from 'react-icons/io5';
import ChatBubble from './ChatBubble'; // Use the new ChatBubble component

interface ChatDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    messages: { text: string; sender: 'user' | 'bot' }[];
    newMessage: string;
    setNewMessage: (value: string) => void;
    sendMessage: (e: React.FormEvent) => void;
    mainTopic: string;
}

const ChatDrawer: React.FC<ChatDrawerProps> = ({ isOpen, onClose, messages, newMessage, setNewMessage, sendMessage, mainTopic }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Background overlay */}
            <div className="fixed inset-0 bg-black/40" onClick={onClose}></div>
            
            {/* Drawer */}
            <div className="relative w-full max-w-md h-full bg-white dark:bg-black flex flex-col shadow-xl">
                <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                    <h2 className="font-bold text-lg text-black dark:text-white">AI Assistant for {mainTopic}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                        <IoClose size={22} className="text-black dark:text-white" />
                    </button>
                </div>

                {/* Message Area */}
                <div className="flex-1 p-4 my-4 overflow-y-auto space-y-4">
                    {messages.map((msg, index) => (
                        <ChatBubble key={index} message={msg} />
                    ))}
                </div>

                {/* Input Form */}
                <form onSubmit={sendMessage} className="p-4 border-t dark:border-gray-700 flex items-center gap-2">
                    <input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Ask anything about this course..."
                        className="flex-1 p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <button type="submit" className="p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                        <IoSend size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatDrawer;