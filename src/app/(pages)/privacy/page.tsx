"use client";

import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import Footers from "../../components/Footers";
import privacy from "../../../data/privacy";

const PrivacyPage: React.FC = () => {
  const [privacyContent, setPrivacyContent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPrivacyContent(privacy.content || "");
    setLoading(false);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header isHome={false} />
      <main className="dark:bg-black flex-1">
        <div className="flex-1 flex items-center justify-center py-10 flex-col px-4">
          <p className="text-center font-black text-4xl text-black dark:text-white">
            {privacy.title}
          </p>

          {loading ? (
            <div className="text-center p-8">Loading...</div>
          ) : privacyContent ? (
            <div
              className="prose dark:prose-invert md:w-2/4 xs:w-full mx-4 py-10 text-justify"
              dangerouslySetInnerHTML={{ __html: privacyContent }}
            />
          ) : (
            <div className="text-center p-4">No privacy policy content available.</div>
          )}
        </div>
      </main>
      <Footers />
    </div>
  );
};

export default PrivacyPage;