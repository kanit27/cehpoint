// src/app/components/MarkdownRenderer.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { marked } from 'marked';
import Prism from 'prismjs';

// Import desired PrismJS languages and a theme
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/themes/prism-okaidia.css'; // A popular dark theme for code

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // When the component mounts or content changes, highlight the code
    if (elementRef.current) {
      Prism.highlightAllUnder(elementRef.current);
    }
  }, [content]);

  // Convert markdown to HTML using the 'marked' library
  const getMarkdownText = () => {
    const rawMarkup = marked(content || '', { breaks: true });
    return { __html: rawMarkup };
  };

  return (
    <div
      ref={elementRef}
      className="prose dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={getMarkdownText()}
    />
  );
};

export default MarkdownRenderer;