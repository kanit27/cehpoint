"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Footers from "../../../components/Footers";
import axiosInstance from "../../../../lib/axios";
import { toast } from "react-toastify";
import YouTube from "react-youtube";
import Image from "next/image";
import { AiOutlineLoading } from "react-icons/ai";
import {
  IoChatbubbleEllipses,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoMenu,
  IoClose,
  IoSparkles,
} from "react-icons/io5";

import CourseSidebar from "@/app/components/course/CourseSidebar";
import CircularProgressBar from "@/app/components/course/CircularProgressBar";
import MarkdownRenderer from "@/app/components/course/MarkdownRenderer";
import ChatDrawer from "@/app/components/course/ChatDrawer";
import Quiz from "@/app/components/course/Quiz"; // Import the new Quiz component
import Projects from "@/app/components/course/Projects";
import ErrorBoundary from "@/app/components/ErrorBoundary";

const CoursePage = () => {
  const router = useRouter();
  const params = useParams();
  // normalize courseId (useParams returns ParamValue which can be string | string[] | undefined)
  const rawCourseId = params?.courseId;
  const courseId = Array.isArray(rawCourseId)
    ? rawCourseId[0]
    : rawCourseId ?? undefined;
  const [theme, setTheme] = useState(false);

  const [courseData, setCourseData] = useState<any>(null);
  const [activeTopic, setActiveTopic] = useState<{
    topicTitle: string;
    subtopicTitle: string;
  } | null>(null);
  const [content, setContent] = useState<{
    theory: string;
    youtube: string;
    image?: string;
    aiExplanation?: string;
  }>({ theory: "", youtube: "" });
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const [view, setView] = useState<"content" | "quiz" | "projects">("content");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [percentage, setPercentage] = useState(0);

  const [messages, setMessages] = useState<
    { text: string; sender: "bot" | "user" }[]
  >([]);
  const [newMessage, setNewMessage] = useState("");

  // track current user id (from sessionStorage)
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserId(sessionStorage.getItem("uid"));
    }
  }, []);

  useEffect(() => {
    const darkMode =
      typeof window !== "undefined" &&
      sessionStorage.getItem("darkMode") === "true";
    setTheme(darkMode);
  }, []);

  const updateProgress = useCallback(() => {
    if (!courseData) return;
    const mainTopicKey = courseData.mainTopic.toLowerCase();
    let doneCount = 0;
    let totalTopics = 0;

    courseData.content[mainTopicKey]?.forEach((topic: any) => {
      topic.subtopics.forEach((subtopic: any) => {
        if (subtopic.done) doneCount++;
        totalTopics++;
      });
    });

    const completionPercentage =
      totalTopics > 0 ? Math.round((doneCount / totalTopics) * 100) : 0;
    setPercentage(completionPercentage);
  }, [courseData]);

  const generateContentForSubtopic = useCallback(
    async (
      topicTitle: string,
      subtopicTitle: string,
      options?: { silent?: boolean }
    ) => {
      const toastId = !options?.silent 
        ? toast.loading("Generating content, please wait...", {
            position: "bottom-center",
            closeButton: false,
            draggable: false,
            autoClose: false,
          }) 
        : null;

      const loadingMessages = [
        "Searching for relevant videos...",
        "Generating AI-powered theory...",
        "Almost there, finalizing content...",
      ];
      let msgIndex = 0;
      const loadingInterval = !options?.silent ? setInterval(() => {
        if (toastId) {
          toast.update(toastId, {
            render: loadingMessages[msgIndex % loadingMessages.length],
          });
          msgIndex++;
        }
      }, 4000) : null;

      if (!options?.silent) setIsGenerating(true);
      try {
        const response = await axiosInstance.post(
          `/api/courses/generate-content`,
          {
            courseId,
            topicTitle,
            subtopicTitle,
          }
        );
        const data = response.data as {
          success: boolean;
          course?: any;
          message?: string;
        };

        console.log("Generate content response:", data);

        if (data.success && data.course) {
          const updatedCourse = data.course;
          
          // Handle both string and object content
          let parsedContent: any;
          if (typeof updatedCourse.content === 'string') {
            parsedContent = JSON.parse(updatedCourse.content);
          } else {
            parsedContent = updatedCourse.content;
          }
          
          console.log("Parsed content:", parsedContent);
          
          // Update course data
          const newCourseData = { ...updatedCourse, content: parsedContent };
          setCourseData(newCourseData);
          
          // Immediately update content after generation
          const mainTopicKey = Object.keys(parsedContent)[0];
          console.log("Main topic key:", mainTopicKey);
          
          if (mainTopicKey) {
            const topic = parsedContent[mainTopicKey]?.find(
              (t: any) => t.title === topicTitle
            );
            console.log("Found topic:", topic?.title);
            
            if (topic) {
              const subtopic = topic.subtopics.find(
                (st: any) => st.title === subtopicTitle
              );
              console.log("Found subtopic:", subtopic?.title, "Theory length:", subtopic?.theory?.length);
              
              if (subtopic) {
                setContent(subtopic);
                if (toastId) toast.dismiss(toastId);
              } else {
                throw new Error("Subtopic not found in response");
              }
            } else {
              throw new Error("Topic not found in response");
            }
          } else {
            throw new Error("Invalid content structure in response");
          }
          
          return {
            success: true,
            course: newCourseData,
          };
        } else {
          throw new Error(data.message || "Failed to generate content");
        }
      } catch (error: any) {
        console.error("Error in generateContentForSubtopic:", error);
        if (toastId) {
          toast.update(toastId, {
            render: error.message || "Failed to generate content.",
            type: "error",
            isLoading: false,
            autoClose: 3000,
          });
        } else {
          toast.error(error.message || "Failed to generate content.");
        }
        return { success: false };
      } finally {
        if (loadingInterval) clearInterval(loadingInterval);
        if (!options?.silent) setIsGenerating(false);
      }
    },
    [courseId]
  );

  const handleSelectSubtopic = useCallback(
    (topicTitle: string, subtopicTitle: string) => {
      if (typeof window !== "undefined" && window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
      setActiveTopic({ topicTitle, subtopicTitle });
      setView("content");
    },
    []
  );

  useEffect(() => {
    if (courseId) {
      const fetchCourse = async () => {
        setLoading(true);
        try {
          const response = await axiosInstance.get(`/api/courses/${courseId}`);
          const data = response.data as {
            content: string;
            mainTopic: string;
            [key: string]: any;
          };
          const parsedContent = JSON.parse(data.content);
          setCourseData({ ...data, content: parsedContent });

          if (!activeTopic) {
            const mainTopicKey = data.mainTopic.toLowerCase();
            const firstTopic = parsedContent[mainTopicKey][0];
            const firstSubtopic = firstTopic.subtopics[0];
            setActiveTopic({
              topicTitle: firstTopic.title,
              subtopicTitle: firstSubtopic.title,
            });
          }
        } catch {
          toast.error("Failed to load course data.");
          router.push("/home");
        } finally {
          setLoading(false);
        }
      };
      fetchCourse();
    }
  }, [courseId]);

  useEffect(() => {
    if (courseData && activeTopic) {
      const contentKeys = Object.keys(courseData.content);
      const mainTopicKey = contentKeys[0];
      const topic = courseData.content[mainTopicKey]?.find(
        (t: any) => t.title === activeTopic.topicTitle
      );
      const subtopic = topic?.subtopics.find(
        (st: any) => st.title === activeTopic.subtopicTitle
      );

      // Only consider theory and youtube as indicators of complete content
      // Image is pre-generated during course creation and should not block content generation
      if (subtopic && (subtopic.theory || subtopic.youtube)) {
        setContent(subtopic);
      } else if (subtopic && !isGenerating) {
        generateContentForSubtopic(
          activeTopic.topicTitle,
          activeTopic.subtopicTitle
        );
      }
      updateProgress();
    }
  }, [courseData, activeTopic, updateProgress, generateContentForSubtopic, isGenerating]);

  useEffect(() => {
    if (courseData?.mainTopic) {
      const defaultMessage = {
        text: `Hey there! I'm your AI teacher. Ask me anything about ${courseData.mainTopic}.`,
        sender: "bot" as const,
      };
      setMessages([defaultMessage]);
    }
  }, [courseData?.mainTopic]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMessage = { text: newMessage, sender: "user" as const };
    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");

    try {
      const response = await axiosInstance.post("/api/ai/chat", {
        prompt: userMessage.text,
      });
      const data = response.data as { text: string };
      const botMessage = { text: data.text, sender: "bot" as const };
      setMessages((prev) => [...prev, botMessage]);
    } catch {
      const errorMessage = {
        text: "Sorry, I couldn't get a response. Please try again.",
        sender: "bot" as const,
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const navigateSubtopic = useCallback(
    (direction: "next" | "prev") => {
      if (!courseData || !activeTopic) return;
      const mainTopicKey = courseData.mainTopic.toLowerCase();
      const topics = courseData.content[mainTopicKey] || [];
      const currentTopicIndex = topics.findIndex(
        (t: any) => t.title === activeTopic.topicTitle
      );
      if (currentTopicIndex === -1) return;

      const currentTopic = topics[currentTopicIndex];
      const currentSubIndex = currentTopic.subtopics.findIndex(
        (s: any) => s.title === activeTopic.subtopicTitle
      );

      let targetTopicIndex = currentTopicIndex;
      let targetSubIndex = currentSubIndex;

      if (direction === "next") {
        if (currentSubIndex < currentTopic.subtopics.length - 1) {
          targetSubIndex = currentSubIndex + 1;
        } else if (currentTopicIndex < topics.length - 1) {
          targetTopicIndex = currentTopicIndex + 1;
          targetSubIndex = 0;
        } else {
          toast.info("No next topic.");
          return;
        }
      } else {
        if (currentSubIndex > 0) {
          targetSubIndex = currentSubIndex - 1;
        } else if (currentTopicIndex > 0) {
          targetTopicIndex = currentTopicIndex - 1;
          const prevTopic = topics[targetTopicIndex];
          targetSubIndex = prevTopic.subtopics.length - 1;
        } else {
          toast.info("No previous topic.");
          return;
        }
      }

      const targetTopic = topics[targetTopicIndex];
      const targetSub = targetTopic.subtopics[targetSubIndex];

      if (targetSub) {
        setActiveTopic({
          topicTitle: targetTopic.title,
          subtopicTitle: targetSub.title,
        });
        setView("content");
      }
    },
    [courseData, activeTopic]
  );

  if (loading || !courseData) {
    return (
      <div className="flex justify-center items-center h-screen dark:bg-black">
        <AiOutlineLoading className="h-12 w-12 animate-spin text-black dark:text-white" />
      </div>
    );
  }

  const mainTopicKey = courseData.mainTopic.toLowerCase();
  const topics = courseData.content[mainTopicKey];

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar (Sticky full height) */}
        <aside className="hidden md:flex md:flex-col md:w-80 md:fixed md:top-0 md:left-0 md:h-screen md:overflow-y-auto  bg-white dark:bg-gray-900 z-40">
          <CourseSidebar
            topics={topics}
            mainTopic={courseData.mainTopic}
            onSelectSubtopic={handleSelectSubtopic}
            onShowQuiz={() => setView("quiz")}
            onShowProjects={() => setView("projects")}
            activeSubtopic={
              view === "content" ? activeTopic?.subtopicTitle || null : null
            }
          />
        </aside>

        {/* Mobile Sidebar */}
        <div
          className={`fixed inset-0 z-60 md:hidden transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/10"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="relative w-full h-full bg-white dark:bg-black shadow-lg overflow-auto">
            <button
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Close menu"
              className="absolute top-3 right-3 z-50 p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <IoClose size={22} />
            </button>
            <CourseSidebar
              topics={topics}
              mainTopic={courseData.mainTopic}
              onSelectSubtopic={handleSelectSubtopic}
              onShowQuiz={() => {
                setView("quiz");
                setIsSidebarOpen(false);
              }}
              onShowProjects={() => {
                setView("projects");
                setIsSidebarOpen(false);
              }}
              activeSubtopic={
                view === "content" ? activeTopic?.subtopicTitle || null : null
              }
              showOnMobile={true}
            />
          </div>
        </div>

        {/* Main Content (with sticky header) */}
        <main className="flex-1 flex flex-col md:ml-80 overflow-y-auto">
          {/* Sticky Header */}
          <div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="md:hidden p-1 -ml-1 text-black dark:text-white"
                  aria-label="Open topics menu"
                >
                  <IoMenu size={26} />
                </button>
                <CircularProgressBar
                  percentage={percentage}
                  isDarkMode={theme}
                />
                <h1 className="text-lg sm:text-xl font-bold capitalize text-black dark:text-white truncate">
                  {courseData.mainTopic}
                </h1>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            {isGenerating ? (
              <div className="flex flex-col justify-center items-center h-full p-6 text-center">
                <AiOutlineLoading className="h-12 w-12 animate-spin text-black dark:text-white" />
                <p className="mt-4 text-black dark:text-white">
                  Generating content, please wait...
                </p>
              </div>
            ) : (
              <>
                {view === "content" && activeTopic && (
                  <div className="px-4 sm:px-6 md:px-8 py-6 max-w-4xl mx-auto">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-black dark:text-white">
                      {activeTopic.subtopicTitle}
                    </h2>

                    {content.youtube && (
                      <div className="my-6 rounded-lg overflow-hidden aspect-video shadow-lg">
                        <YouTube
                          videoId={content.youtube}
                          className="w-full h-full"
                          opts={{ width: "100%", height: "100%" }}
                        />
                      </div>
                    )}

                    {content.image && !content.youtube && (
                      <div className="my-6">
                        <div className="relative w-full h-[500px] max-h-[60vh]">
                          <Image
                            src={content.image}
                            alt={activeTopic.subtopicTitle}
                            fill
                            className="object-contain rounded-lg"
                            sizes="(max-width: 640px) 100vw, 800px"
                          />
                        </div>
                      </div>
                    )}

                    {isGenerating && !content.theory ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <AiOutlineLoading className="animate-spin text-blue-600 dark:text-blue-400" size={40} />
                          <p className="text-gray-600 dark:text-gray-400 font-medium">Generating content for you...</p>
                        </div>
                      </div>
                    ) : (
                      <MarkdownRenderer
                        content={
                          content.theory ||
                          "No theory available for this topic yet."
                        }
                      />
                    )}

                    <div className="mt-8 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                      <button
                        onClick={() => navigateSubtopic("prev")}
                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-medium transition w-full sm:w-auto"
                        aria-label="Previous topic"
                      >
                        <IoChevronBackOutline size={16} />
                        <span>Previous</span>
                      </button>

                      <button
                        onClick={() => navigateSubtopic("next")}
                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium transition w-full sm:w-auto"
                        aria-label="Next topic"
                      >
                        <span>Next</span>
                        <IoChevronForwardOutline size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {view === "quiz" && userId && courseId && (
                  <Quiz
                    courseTitle={courseData.mainTopic}
                    courseId={courseId}
                    userId={userId}
                  />
                )}
                {view === "projects" && (
                  <Projects
                    courseTitle={courseData?.mainTopic}
                    parentLoading={loading}
                  />
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Floating Chat Bubble */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-blue-600 text-white rounded-full flex justify-center items-center shadow-lg hover:bg-blue-700 transition"
        aria-label="Open chat"
      >
        <IoChatbubbleEllipses size={28} />
      </button>

      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={messages}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        sendMessage={sendMessage}
        mainTopic={courseData.mainTopic}
      />
    </div>
  );
};

export default function CoursePageWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <CoursePage />
    </ErrorBoundary>
  );
}
