// components/landing/SlideOne.tsx
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import slide from "../../assets/slideOneNew.png";

const SlideOne: React.FC = () => {
  return (
    <div className="flex flex-col items-center dark:bg-black pt-0 pb-5 md:pt-10 md:pb-20">
      <h1 className="text-4xl max-md:text-2xl font-black text-center mt-10 max-xl:px-4 dark:text-white">
        AI Learning Made Effortless: Earn Certifications, Land Your Dream Job,
        and Stay Ahead!
      </h1>
      <p className="text-center text-1xl text-black mt-6 max-w-1xl font-medium max-md:text-xs dark:text-white mx-20 max-md:mx-6">
        Experience the Future of Learning with Our AI-Powered Platform...
      </p>
      
      <div className="flex space-x-4 mb-8 mt-6">
        <Link href="/signin" className="border-black text-black border px-3 py-2 font-medium dark:border-white dark:text-white">
          SignIn
        </Link>
        <Link href="/signup" className="bg-black text-white px-3 py-2 font-medium dark:bg-white dark:text-black">
          SignUp
        </Link>
      </div>

      <Image
        src={slide}
        alt="AI Learning Platform Showcase"
        className="w-[70%]"
        placeholder="blur" // Adds a nice blur-up effect
        priority
      />
    </div>
  );
};

export default SlideOne;