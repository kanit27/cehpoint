// app/pages/Contact.tsx

import React from "react";
import Header from "../../components/Header";
import Footers from "../../components/Footers";

const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header isHome={true} />
      <main className="dark:bg-black bg-white flex-1">
        <div className="max-w-3xl mx-auto px-4 py-16 flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl font-black text-black dark:text-white text-center mb-6">
            Get In Touch
          </h1>
          
          <p className="text-lg text-center text-gray-800 dark:text-gray-200 mb-8 max-w-xl">
            Thank you for your interest in reaching out to us. We're here to help with any questions or inquiries you might have.
          </p>
          
          <div className="w-full max-w-md bg-gray-50 dark:bg-gray-900 p-8 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 mb-8">
            <h2 className="text-2xl font-bold text-black dark:text-white mb-4">
              Contact Information
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              For immediate assistance, please call us directly...
            </p>
            <div className="flex items-center justify-center">
              <div className="bg-black dark:bg-white py-4 px-8 rounded">
                <p className="text-white dark:text-black font-bold text-xl md:text-2xl">
                  Call us: (+91) 33 6902 9331
                </p>
              </div>
            </div>
          </div>
          
          <div className="text-center max-w-lg">
            <h3 className="text-xl font-bold text-black dark:text-white mb-3">
              Office Hours
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Monday - Friday: 2:00 PM - 10:00 PM<br />
              Saturday - Sunday: Closed
            </p>
            <h3 className="text-xl font-bold text-black dark:text-white mb-3">
              Location
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              SANDIPAN PARA, Bolpur Labpur Road<br />
              Labhpur<br />
              West Bengal, 731303
            </p>
          </div>
        </div>
      </main>
      <Footers />
    </div>
  );
};

export default ContactPage;