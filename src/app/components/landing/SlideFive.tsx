// components/landing/SlideFive.tsx

"use client";

import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { reviews } from "../../../lib/constants";

interface Review {
    rating: string;
    data: string;
    photo: string;
    username: string;
    profession: string;
}

const SlideFive: React.FC = () => {
  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    arrows: false,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  // Helper function to render star ratings
  const renderStars = (review: Review) => {
    const filledStars = Math.floor(Number(review.rating));
    const emptyStars = 5 - filledStars;

    return (
      <div className="flex">
        {[...Array(filledStars)].map((_, i) => (
          <svg
            key={`filled-${i}`}
            className="w-5 h-5 text-yellow-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.966a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.921-.755 1.688-1.54 1.118l-3.38-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.784.57-1.838-.197-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.049 9.393c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.966z" />
          </svg>
        ))}
        {[...Array(emptyStars)].map((_, i) => (
          <svg
            key={`empty-${i}`}
            className="w-5 h-5 text-gray-300 dark:text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.966a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.921-.755 1.688-1.54 1.118l-3.38-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.784.57-1.838-.197-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.049 9.393c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.966z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="dark:bg-black">
      <Slider {...settings}>
        {reviews.map((review: Review, index: number) => (
          <div key={index} className="w-full">
            <figure className="mx-auto max-w-screen-md flex flex-col items-center py-16 dark:bg-black">
              <div className="mb-4 flex items-center">
                {renderStars(review)}
              </div>
              <blockquote>
                <p className="text-center text-xs font-bold text-black dark:text-white lg:text-sm max-md:px-2">
                  {review.data}
                </p>
              </blockquote>
              <figcaption className="mt-6 flex items-center space-x-3 max-lg:px-3">
                <img
                  src={review.photo}
                  alt={`Profile picture of ${review.username}`}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex items-center divide-x-2 divide-black dark:divide-white">
                  <cite className="pr-3 text-sm font-bold text-black dark:text-white max-sm:text-xs">
                    {review.username}
                  </cite>
                  <cite className="pl-3 text-sm font-normal text-black dark:text-white max-md:text-xs">
                    {review.profession}
                  </cite>
                </div>
              </figcaption>
            </figure>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default SlideFive;