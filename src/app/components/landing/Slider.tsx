"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import urls from "../../assets/pictures";
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
    const paths = ["/signin", "/signin", "/signin"];
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
    adaptiveHeight: true,
    pauseOnHover: false,
    pauseOnFocus: false,
    swipeToSlide: true,
    touchMove: true,
    draggable: true,
    afterChange: (index: number) => setCurrentIndex(index),
  };

  return (
    <div className="w-full">
      <div className="relative overflow-hidden w-full bg-white dark:bg-black transition-colors duration-500">
        <Slider {...settings} ref={sliderRef}>
          {urls.map((url, index: number) => (
            <div key={index} className="w-full flex flex-col items-stretch">
              {/* Image (keeps original aspect by using object-cover and responsive heights) */}
              <div className="relative w-full h-96 sm:h-96">
                <Image
                  src={url}
                  alt={`Slide ${index}`}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
              </div>

              {/* Text block below the image - slides together with the image */}
              <div className="px-6 py-6 bg-white dark:bg-black text-center flex flex-col items-center gap-4">
                <p className="text-lg sm:text-2xl font-bold text-black dark:text-white">
                  {text[index]}
                </p>
                <button
                  onClick={handleClick}
                  className="px-4 py-2 bg-black text-white rounded-md hover:opacity-90 transition"
                >
                  {buttons[index]}
                </button>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default CustomSlider;