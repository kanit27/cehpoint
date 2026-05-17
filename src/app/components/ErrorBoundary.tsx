"use client";
import React, { Component } from "react";
import Link from "next/link";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen dark:bg-black dark:text-white p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Something went wrong</h2>
          <p className="mb-6 text-lg text-gray-600 dark:text-gray-400">
            {this.state.error?.message || "An unexpected error occurred"}
          </p>
          <div className="flex gap-4">
            <Link
              href="/home"
              className="px-6 py-2 bg-black text-white dark:bg-white dark:text-black font-bold rounded"
            >
              Go Home
            </Link>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: undefined });
                window.location.reload();
              }}
              className="px-6 py-2 border border-black dark:border-white font-bold rounded"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
