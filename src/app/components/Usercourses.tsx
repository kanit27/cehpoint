"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Changed from useNavigate
import axiosInstance from "../../lib/axios"; // Assuming axios is in lib/axios.ts
import foundImg from "../assets/found.svg";
import Image from "next/image";

// Define an interface for the course object for type safety
interface Course {
  _id: string;
  photo: string;
  mainTopic: string;
  type: string;
  date: string;
  content: string;
  lang: string;
  completed: boolean;
  end: string;
}

interface UserCoursesProps {
  userId: string | null;
}

const UserCourses: React.FC<UserCoursesProps> = ({ userId }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [processing, setProcessing] = useState(true);
  const router = useRouter(); // Using Next.js router

  useEffect(() => {
    if (!userId) {
      setProcessing(false);
      return; // Don't fetch if userId is not available
    }

    const fetchUserCourses = async () => {
      const postURL = `/api/courses?userId=${userId}`;
      try {
        const response = await axiosInstance.get<Course[]>(postURL);
        setCourses(response.data);
      } catch (error) {
        console.error("Error fetching user courses:", error);
        // Avoid infinite loop on error by not calling fetchUserCourses recursively here
      } finally {
        setProcessing(false);
      }
    };

    fetchUserCourses();
  }, [userId]);

  function redirectGenerate() {
    router.push("/create");
  }

  const handleCourse = (
    content: string,
    mainTopic: string,
    type: string,
    lang: string,
    courseId: string,
    completed: boolean,
    end: string
  ) => {
    try {
      const jsonData = JSON.parse(content);
      sessionStorage.setItem("courseId", courseId);
      sessionStorage.setItem("first", String(completed));
      sessionStorage.setItem("lang", lang ? lang : "English");
      sessionStorage.setItem("jsonData", JSON.stringify(jsonData));

      // In Next.js, we pass state differently. A common way is to use query parameters.
      router.push(
        `/course?mainTopic=${encodeURIComponent(
          mainTopic.toUpperCase()
        )}&type=${type.toLowerCase()}&courseId=${courseId}&end=${
          completed ? end : ""
        }`
      );
    } catch (error) {
      console.error("Failed to parse course content:", error);
      // Optionally, show a user-facing error message here
    }
  };

  if (processing) {
    return (
      <div className="text-center h-screen w-screen flex items-center justify-center">
        {/* Spinner Component Here */}
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="my-4">
      {courses.length === 0 ? (
        <div className="text-center h-center flex flex-col items-center justify-center">
          <Image
            alt="Nothing found"
            src={foundImg}
            className="max-w-sm h-3/6"
          />
          <p className="text-black font-black dark:text-white text-xl">
            Nothing Found
          </p>
          <button
            onClick={redirectGenerate}
            className="bg-black text-white px-5 py-2 mt-4 font-medium dark:bg-white dark:text-black"
          >
            Generate Course
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6 px-10">
          {courses.map((course) => (
            <div
              key={course._id}
              className="flex flex-col border border-black/40 dark:border-white/40 rounded-lg overflow-hidden h-full"
            >
              <div className="w-full">
                <Image
                  src={
                    course.photo && course.photo !== "default_image_url"
                      ? course.photo
                      : "/ai2.jpeg" // Using public path for default image
                  }
                  alt={course.mainTopic}
                  width={500}
                  height={300}
                  className="w-full object-cover sm:aspect-[5/4] sm:h-48 md:aspect-[2/1] md:h-auto"
                />
              </div>
              <div className="flex flex-col flex-grow p-4 justify-center items-center">
                <h5 className="text-lg font-bold tracking-tight text-black dark:text-white truncate w-[100%] text-center">
                  {course.mainTopic.toUpperCase()}
                </h5>
                <p className="font-normal text-sm capitalize text-black dark:text-white">
                  {course.type}
                </p>
                <p className="font-normal text-sm text-black dark:text-white">
                  {new Date(course.date).toLocaleDateString()}
                </p>
              </div>
              <div className="p-4 flex items-center justify-center">
                <button
                  onClick={() =>
                    handleCourse(
                      course.content,
                      course.mainTopic,
                      course.type,
                      course.lang,
                      course._id,
                      course.completed,
                      course.end
                    )
                  }
                  className="rounded-md w-full bg-black text-white px-4 py-2 font-medium dark:bg-white dark:text-black"
                >
                  Continue
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserCourses;
