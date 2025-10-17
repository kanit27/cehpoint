"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
// import Header from "../../../components/Header";
import Footers from "../../../components/Footers";
import axiosInstance from "../../../../lib/axios";
import { toast } from "react-toastify";
import YouTube from "react-youtube";
import { AiOutlineLoading } from "react-icons/ai";
import {
  IoChatbubbleEllipses,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoMenu,
  IoClose,
} from "react-icons/io5";

// Import the new custom components
import CourseSidebar from "@/app/components/course/CourseSidebar";
import CircularProgressBar from "@/app/components/course/CircularProgressBar";
import MarkdownRenderer from "@/app/components/course/MarkdownRenderer";
import ChatDrawer from "@/app/components/course/ChatDrawer";

// Placeholders for Quiz and Projects components
const QuizView = ({ courseTitle }: { courseTitle: string }) => (
  <div className="p-8 text-center">Quiz for {courseTitle} will be shown here.</div>
);
const ProjectsView = ({ courseTitle }: { courseTitle: string }) => (
  <div className="p-8 text-center">Projects for {courseTitle} will be shown here.</div>
);

const CoursePage = () => {
  const router = useRouter();
  const params = useParams();
  const { courseId } = params;
  const [theme, setTheme] = useState(false);

  // Page State
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

  // UI State
  const [view, setView] = useState<"content" | "quiz" | "projects">("content");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // mobile menu

  // Progress State
  const [percentage, setPercentage] = useState(0);

  // Chat State
  const [messages, setMessages] = useState<{ text: string; sender: "bot" | "user" }[]>(
    []
  );
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const darkMode =
      typeof window !== "undefined" &&
      sessionStorage.getItem("darkMode") === "true";
    setTheme(darkMode);
  }, []);

  // Ensure mobile viewport meta exists as a fallback
  useEffect(() => {
    if (typeof document !== "undefined") {
      const existing = document.querySelector('meta[name="viewport"]');
      if (!existing) {
        const meta = document.createElement("meta");
        meta.name = "viewport";
        meta.content = "width=device-width, initial-scale=1";
        document.head.appendChild(meta);
      }
    }
  }, []);

  const updateProgress = useCallback(() => {
    if (!courseData) return;
    const mainTopicKey = courseData.mainTopic.toLowerCase();
    let doneCount = 0;
    let totalTopics = 0;

    courseData.content[mainTopicKey]?.forEach((topic: any) => {
      topic.subtopics.forEach((subtopic: any) => {
        if (subtopic.done) {
          doneCount++;
        }
        totalTopics++;
      });
    });

    const completionPercentage =
      totalTopics > 0 ? Math.round((doneCount / totalTopics) * 100) : 0;
    setPercentage(completionPercentage);
  }, [courseData]);

  // GENERATE CONTENT helper
  // options.silent = true -> do not set global isGenerating (no overlay)
  const generateContentForSubtopic = useCallback(
    async (topicTitle: string, subtopicTitle: string, options?: { silent?: boolean }) => {
      if (!options?.silent) setIsGenerating(true);
      try {
        const response = await axiosInstance.post(`/api/courses/generate-content`, {
          courseId,
          topicTitle,
          subtopicTitle,
        });
        const data = response.data as { success: boolean; course?: any; message?: string };

        if (data.success && data.course) {
          const updatedCourse = data.course;
          const parsedContent = JSON.parse(updatedCourse.content);
          setCourseData({ ...updatedCourse, content: parsedContent });
          return { success: true, course: { ...updatedCourse, content: parsedContent } };
        } else {
          if (!options?.silent) {
            toast.error(data.message || "Failed to generate content.");
          } else {
            toast.error(data.message || "Failed to generate content.");
          }
          return { success: false };
        }
      } catch (error) {
        if (!options?.silent) {
          toast.error("Failed to generate content.");
        } else {
          toast.error("Failed to generate content.");
        }
        return { success: false };
      } finally {
        if (!options?.silent) setIsGenerating(false);
      }
    },
    [courseId]
  );

  // Handle user click on sidebar subtopic
  const handleSelectSubtopic = useCallback(
    async (topicTitle: string, subtopicTitle: string) => {
      // close mobile sidebar when selecting
      if (typeof window !== "undefined" && window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }

      if (!courseData) return;

      const mainTopicKey = courseData.mainTopic.toLowerCase();
      const topic = courseData.content[mainTopicKey]?.find((t: any) => t.title === topicTitle);
      const subtopic = topic?.subtopics.find((st: any) => st.title === subtopicTitle);

      if (subtopic && (subtopic.theory || subtopic.youtube || subtopic.image)) {
        setActiveTopic({ topicTitle, subtopicTitle });
        setView("content");
        return;
      }

      const toastId = toast.loading("Please Wait", {
        position: "bottom-center",
        closeButton: false,
        draggable: false,
        autoClose: false,
      });

      const result = await generateContentForSubtopic(topicTitle, subtopicTitle, { silent: true });

      if (result.success) {
        toast.dismiss(toastId);
        setActiveTopic({ topicTitle, subtopicTitle });
        setView("content");
      } else {
        toast.update(toastId, {
          render: "Failed to generate content. Please try again.",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    },
    [courseData, generateContentForSubtopic]
  );

  // Fetch initial course data
  useEffect(() => {
    if (courseId) {
      const fetchCourse = async () => {
        setLoading(true);
        try {
          const response = await axiosInstance.get(`/api/courses/${courseId}`);
          const data = response.data as { content: string; mainTopic: string; [key: string]: any };

          const parsedContent = JSON.parse(data.content);
          setCourseData({ ...data, content: parsedContent });

          if (!activeTopic) {
            const mainTopicKey = data.mainTopic.toLowerCase();
            const firstTopic = parsedContent[mainTopicKey][0];
            const firstSubtopic = firstTopic.subtopics[0];
            setActiveTopic({ topicTitle: firstTopic.title, subtopicTitle: firstSubtopic.title });
          }
        } catch (error) {
          toast.error("Failed to load course data.");
          router.push("/home");
        } finally {
          setLoading(false);
        }
      };
      fetchCourse();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  // Update content when activeTopic changes or courseData is updated
  useEffect(() => {
    if (courseData && activeTopic) {
      const mainTopicKey = courseData.mainTopic.toLowerCase();
      const topic = courseData.content[mainTopicKey]?.find((t: any) => t.title === activeTopic.topicTitle);
      const subtopic = topic?.subtopics.find((st: any) => st.title === activeTopic.subtopicTitle);

      if (subtopic && (subtopic.theory || subtopic.youtube || subtopic.image)) {
        setContent(subtopic);
      } else if (subtopic) {
        generateContentForSubtopic(activeTopic.topicTitle, activeTopic.subtopicTitle);
      }
      updateProgress();
    }
  }, [courseData, activeTopic, generateContentForSubtopic, updateProgress]);

  // Chat Logic
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
      const response = await axiosInstance.post("/api/ai/chat", { prompt: userMessage.text });
      const data = response.data as { text: string };
      const botMessage = { text: data.text, sender: "bot" as const };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = { text: "Sorry, I couldn't get a response. Please try again.", sender: "bot" as const };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  // NAVIGATION: next / previous subtopic
  const navigateSubtopic = useCallback(
    async (direction: "next" | "prev") => {
      if (!courseData || !activeTopic) return;
      const mainTopicKey = courseData.mainTopic.toLowerCase();
      const topics = courseData.content[mainTopicKey] || [];
      const currentTopicIndex = topics.findIndex((t: any) => t.title === activeTopic.topicTitle);
      if (currentTopicIndex === -1) return;

      const currentTopic = topics[currentTopicIndex];
      const currentSubIndex = currentTopic.subtopics.findIndex((s: any) => s.title === activeTopic.subtopicTitle);

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

      if (targetSub && (targetSub.theory || targetSub.youtube || targetSub.image)) {
        setActiveTopic({ topicTitle: targetTopic.title, subtopicTitle: targetSub.title });
        setView("content");
      } else {
        const toastId = toast.loading("Please Wait", {
          position: "bottom-center",
          closeButton: false,
          draggable: false,
          autoClose: false,
        });

        const res = await generateContentForSubtopic(targetTopic.title, targetSub.title, { silent: true });
        if (res.success) {
          toast.dismiss(toastId);
          setActiveTopic({ topicTitle: targetTopic.title, subtopicTitle: targetSub.title });
          setView("content");
        } else {
          toast.update(toastId, {
            render: "Failed to generate content for the selected topic.",
            type: "error",
            isLoading: false,
            autoClose: 3000,
          });
        }
      }
    },
    [courseData, activeTopic, generateContentForSubtopic]
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
    <div className="flex flex-col min-h-screen">
      {/* <Header isHome={true} /> */}
      <div className="flex-1 flex dark:bg-gray-900 border-b-[1px] border-gray-300 dark:border-gray-700">
        {/* Mobile menu overlay + off-canvas sidebar (only shown when toggled) */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden" aria-hidden={!isSidebarOpen} onClick={() => setIsSidebarOpen(false)}>
            <div className="absolute inset-0 bg-black/50" />
          </div>
        )}

        {isSidebarOpen && (
          <aside className="fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-gray-900 shadow-lg md:hidden">
            <div className="overflow-y-auto h-full">
              <CourseSidebar
                topics={topics}
                mainTopic={courseData.mainTopic}
                onSelectSubtopic={(t, s) => {
                  setIsSidebarOpen(false);
                  handleSelectSubtopic(t, s);
                }}
                onShowQuiz={() => {
                  setView("quiz");
                  setIsSidebarOpen(false);
                }}
                onShowProjects={() => {
                  setView("projects");
                  setIsSidebarOpen(false);
                }}
                activeSubtopic={view === "content" ? activeTopic?.subtopicTitle || null : null}
                showOnMobile={true} // enable mobile rendering
              />
            </div>
          </aside>
        )}

        {/* render desktop sidebar only on md+; mobile uses isSidebarOpen aside */}
        <div className="hidden md:block">
          <CourseSidebar
            topics={topics}
            mainTopic={courseData.mainTopic}
            onSelectSubtopic={handleSelectSubtopic}
            onShowQuiz={() => setView("quiz")}
            onShowProjects={() => setView("projects")}
            activeSubtopic={view === "content" ? activeTopic?.subtopicTitle || null : null}
          />
        </div>

        <main className="flex-1">
          <div className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
            <div className="justify-between mx-auto flex gap-4 px-4 sm:px-6 md:px-8 py-4 items-center">
              <div className="flex items-center gap-4">
                {/* Mobile menu button */}
                <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-black dark:text-white mr-1" aria-label="Open topics menu">
                  <IoMenu size={24} />
                </button>

                <CircularProgressBar percentage={percentage} isDarkMode={theme} />
                <h1 className="text-lg sm:text-xl md:text-3xl font-bold capitalize text-black dark:text-white truncate">
                  {courseData.mainTopic}
                </h1>
              </div>
            </div>
          </div>

          {isGenerating ? (
            <div className="flex justify-center items-center h-full p-6 overflow-y-auto no-scrollbar">
              <AiOutlineLoading className="h-12 w-12 animate-spin text-black dark:text-white" />
              <p className="ml-4 text-black dark:text-white">Generating content, please wait...</p>
            </div>
          ) : (
            <>
              {view === "content" && activeTopic && (
                <div className="px-4 sm:px-6 md:px-8 py-4 max-w-4xl mx-auto overflow-y-auto no-scrollbar">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 text-black dark:text-white">
                    {activeTopic.subtopicTitle}
                  </h2>

                  {content.youtube && (
                    <div className="mb-6 rounded-lg overflow-hidden aspect-video">
                      <YouTube videoId={content.youtube} className="w-full h-full" />
                    </div>
                  )}

                  {content.image && !content.youtube && (
                    <div className="mb-6">
                      <img src={content.image} alt={activeTopic.subtopicTitle} className="w-full h-auto max-h-[60vh] sm:max-h-[45vh] md:max-h-[500px] object-contain rounded-lg" />
                    </div>
                  )}

                  <MarkdownRenderer content={content.theory || ""} />

                  {/* NEXT / PREV buttons at end of content */}
                  <div className="mt-6 flex justify-between items-center">
                    <button onClick={() => navigateSubtopic("prev")} className="flex items-center gap-2 px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-medium" aria-label="Previous topic">
                      <IoChevronBackOutline size={16} />
                      <span>Previous</span>
                    </button>

                    <button onClick={() => navigateSubtopic("next")} className="flex items-center gap-2 px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium" aria-label="Next topic">
                      <span>Next</span>
                      <IoChevronForwardOutline size={16} />
                    </button>
                  </div>
                </div>
              )}
              {view === "quiz" && <QuizView courseTitle={courseData.mainTopic} />}
              {view === "projects" && <ProjectsView courseTitle={courseData.mainTopic} />}
            </>
          )}
        </main>

        <button onClick={() => setIsChatOpen(true)} className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-blue-600 text-white rounded-full flex justify-center items-center shadow-lg hover:bg-blue-700 transition" aria-label="Open chat">
          <IoChatbubbleEllipses size={30} />
        </button>

        <ChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} messages={messages} newMessage={newMessage} setNewMessage={setNewMessage} sendMessage={sendMessage} mainTopic={courseData.mainTopic} />
      </div>

      <Footers />
    </div>
  );
};

export default CoursePage;