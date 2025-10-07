"use client";

import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import Footers from "../../components/Footers";
import axiosInstance from "../../../lib/axios";

const TermsPolicy = () => {
  const [termsContent, setTermsContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        setLoading(true);
        interface TermsResponse {
          content: string;
        }
        const response = await axiosInstance.get<TermsResponse>("/terms");
        if (response.data && response.data.content) {
          setTermsContent(response.data.content);
        } else {
          setTermsContent("");
        }
        setError(null);
      } catch (err) {
        setError("Failed to load terms content. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTerms();
  }, []);

  const renderTermsContent = () => {
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

    if (!termsContent || termsContent.trim() === "") {
      return <div className="text-center p-4">No terms content available.</div>;
    }

    return (
      <div
        className="md:w-2/4 xs:w-full mx-4 py-10 text-justify text-black dark:text-white"
        dangerouslySetInnerHTML={{ __html: termsContent }}
      />
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header isHome={false} className="sticky top-0 z-50" />
      <div className="dark:bg-black flex-1">
        <div className="flex-1 flex items-center justify-center py-10 flex-col">
          <p className="text-center font-black text-4xl text-black dark:text-white">
            Terms
          </p>
          {renderTermsContent()}
        </div>
      </div>
      <Footers className="sticky bottom-0 z-50" />
    </div>
  );
};

export default TermsPolicy;