"use client";

import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import Footers from "../../components/Footers";
import axiosInstance from "../../../lib/axios";

const PrivacyPage: React.FC = () => {
  const [privacyContent, setPrivacyContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrivacyPolicy = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get<{ content: string }>("/privacy");
        setPrivacyContent(response.data?.content || "");
        setError(null);
      } catch (err) {
        setError("Failed to load privacy policy. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPrivacyPolicy();
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center p-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      );
    }
    if (error) {
      return <div className="text-red-500 text-center p-4">{error}</div>;
    }
    if (!privacyContent) {
      return <div className="text-center p-4">No privacy policy content available.</div>;
    }
    return (
      <div 
        className="prose dark:prose-invert md:w-2/4 xs:w-full mx-4 py-10 text-justify"
        dangerouslySetInnerHTML={{ __html: privacyContent }}
      />
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header isHome={false} />
      <main className="dark:bg-black flex-1">
        <div className="flex-1 flex items-center justify-center py-10 flex-col">
          <p className="text-center font-black text-4xl text-black dark:text-white">
            Privacy Policy
          </p>
          {renderContent()}
        </div>
      </main>
      <Footers />
    </div>
  );
};

export default PrivacyPage;