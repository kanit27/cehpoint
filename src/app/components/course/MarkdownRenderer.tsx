// src/app/components/course/MarkdownRenderer.tsx
"use client";

import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="prose prose-lg dark:prose-invert max-w-none text-black dark:text-white">
      <ReactMarkdown
        components={{
          // Main heading from the prompt (##)
          h2: ({ node, ...props }) => (
            <h2 className="text-3xl font-bold mt-8 mb-4 border-b pb-2 border-gray-300 dark:border-gray-700" {...props} />
          ),
          // Subheading from the prompt (###)
          h3: ({ node, ...props }) => (
            <h3 className="text-2xl font-semibold mt-6 mb-3" {...props} />
          ),
          // Standard paragraph text
          p: ({ node, ...props }) => (
            <p className="mb-4 leading-relaxed" {...props} />
          ),
          // Unordered lists (bullets)
          ul: ({ node, ...props }) => (
            <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />
          ),
          // Code blocks (```)
          code: ({ node, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            // For code blocks (```javascript)
            if (match) {
              return (
                <div className="bg-gray-900 text-white rounded-md my-4">
                   <div className="px-4 py-2 text-sm text-gray-400 border-b border-gray-700">
                    {match[1]} {/* This will show 'javascript', 'bash', etc. */}
                  </div>
                  <pre className="p-4 overflow-x-auto">
                    <code {...props}>{children}</code>
                  </pre>
                </div>
              );
            }
            // For inline code (`code`)
            return (
              <code className="bg-gray-200 dark:bg-gray-700 rounded-md px-2 py-1 text-sm font-mono" {...props}>
                {children}
              </code>
            );
          },
          // Bold text
          strong: ({ node, ...props }) => (
            <strong className="font-bold" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;