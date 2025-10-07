// components/landing/Slider.tsx

"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import urls from "../../assets/pictures"; // Assuming this path is correct
import Image from "next/image";

const CustomSlider: React.FC = () => {
  const sliderRef = useRef<Slider>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();

  const text = [
    "Generate courses using AI",
    "Learn and Upskill yourself",
    "Prepare for your Dream job",
  ];
  const buttons = ["Generate", "Learn", "More"];

  const handleClick = () => {
    const paths = ["/create", "/course", "/about"];
    router.push(paths[currentIndex]);
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    arrows: false,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    afterChange: (index: number) => setCurrentIndex(index),
  };

  return (
    <div className="">
      <div className="relative overflow-hidden w-full h-96 bg-white dark:bg-black transition-colors duration-500">
        <Slider {...settings} ref={sliderRef}>
          {urls.map((url, index: number) => (
            <div key={index} className="relative w-full h-96">
                {/* ... your mobile view JSX ... */}
                <div className="hidden sm:flex w-full h-full">
                  <div className="w-full sm:w-1/4 p-4 sm:p-8 flex flex-col justify-center items-center">
                    <p className="mb-6 px-4 text-lg sm:text-2xl sm:px-0 font-bold text-black dark:text-white text-center">
                      {text[index]}
                    </p>
                    <button
                      className="px-3 py-1 sm:px-4 sm:py-2 rounded-md hover:bg-opacity-80 transition duration-300 bg-black text-white dark:bg-white dark:text-black text-sm sm:text-base"
                      onClick={handleClick}
                    >
                      {buttons[index]}
                    </button>
                  </div>
                  <div className="relative w-full sm:w-3/4 h-full">
                    <Image
                      src={url}
                      alt={`Slide ${index}`}
                      fill
                      style={{ objectFit: 'cover' }}
                      priority={index === 0} // Prioritize loading the first image
                    />
                  </div>
                </div>
            </div>
          ))}
        </Slider>
        {/* ... your next/prev buttons ... */}
      </div>
    </div>
  );
};

export default CustomSlider;