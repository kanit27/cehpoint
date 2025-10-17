// components/landing/SlideTwo.tsx

import React from "react";
import Image from "next/image";
import slide from "../../assets/slideTwoNew.jpg"; // Ensure this path is correct
import { PiStudentFill, PiFeatherFill } from "react-icons/pi";

const SlideTwo: React.FC = () => {
  return (
    <div className="px-7 justify-center items-center pb-28 dark:bg-black">
      <div className="flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 h-full p-4 flex flex-col items-center justify-center">
          <h2 className="text-4xl font-black mb-2 max-md:text-2xl dark:text-white max-md:text-center text-center">
            Unleash Limitless Learning: Fuel Your Mind, Shape Your Future!
          </h2>
          <p className="text-black mb-2 mt-2 max-md:text-center max-md:text-xs dark:text-white text-center">
            Effortlessly Craft Engaging and Impactful Courses with Our
            Platform...
          </p>
          {/* ... Rest of the text and icons JSX ... */}
          <div className="flex flex-row justify mt-4 w-[90%]">
            <div className="w-1/2 mb-2 md:mb-0  mx-2 max-md:text-center flex flex-row">
              <div>
                <div className="max-md:flex max-md:justify-center max-md:items-center pr-2">
                  <PiStudentFill className="text-2xl text-center max-md:text-xl dark:text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 max-md:text-xl dark:text-white">
                  Study Online
                </h3>
                {/* <p className="text-black max-md:text-xs dark:text-white">
                  Video & Theory Lecture
                </p> */}
              </div>
            </div>

            <div className="w-1/2 mb-2 md:mb-0 mx-2 max-md:text-center flex flex-row">
              <div>
                <div className="max-md:flex max-md:justify-center max-md:items-center pr-2">
                  <PiFeatherFill className="text-2xl max-md:text-xl dark:text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 max-md:text-xl dark:text-white">
                  Create Course
                </h3>
                {/* <p className="text-black max-md:text-xs dark:text-white">
                  Create Course on Any Topic
                </p> */}
              </div>
            </div>
          </div>
        </div>
        <div className="md:w-1/2 h-full">
          <Image
            src={slide}
            alt="Students learning online"
            className="w-[95%] object-cover"
            placeholder="blur"
          />
        </div>
      </div>
    </div>
  );
};

export default SlideTwo;
