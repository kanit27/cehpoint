"use client";

import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import Footers from "../../components/Footers";
import terms from "../../../data/terms";

const TermsPolicy: React.FC = () => {
  const [termsContent, setTermsContent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTermsContent(terms.content || "");
    setLoading(false);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header isHome={false} className="sticky top-0 z-50" />
      <div className="dark:bg-black flex-1">
        <div className="flex-1 flex items-center justify-center py-10 flex-col px-4">
          <p className="text-center font-black text-4xl text-black dark:text-white">
            {terms.title}
          </p>

          {loading ? (
            <div className="text-center p-8">Loading...</div>
          ) : termsContent ? (
            <div
              className="md:w-2/4 xs:w-full mx-4 py-10 text-justify text-black dark:text-white"
              dangerouslySetInnerHTML={{ __html: termsContent }}
            />
          ) : (
            <div className="text-center p-4">No terms content available.</div>
          )}
        </div>
      </div>
      <Footers className="sticky bottom-0 z-50" />
    </div>
  );
};

export default TermsPolicy;