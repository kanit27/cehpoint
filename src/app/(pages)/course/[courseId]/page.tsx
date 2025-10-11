// src/app/(pages)/course/[courseId]/page.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '../../../components/Header';
import Footers from '../../../components/Footers';
import axiosInstance from '../../../../lib/axios';
import { toast } from 'react-toastify';
import YouTube from 'react-youtube';
import { AiOutlineLoading } from 'react-icons/ai';
import { IoChatbubbleEllipses } from "react-icons/io5";

// Import the new custom components
import CourseSidebar from '@/app/components/course/CourseSidebar';
import CircularProgressBar from '@/app/components/course/CircularProgressBar';
import MarkdownRenderer from '@/app/components/MarkdownRenderer';
import ChatDrawer from '@/app/components/course/ChatDrawer';

// Placeholders for Quiz and Projects components
const QuizView = ({ courseTitle }: { courseTitle: string }) => <div className="p-8 text-center">Quiz for {courseTitle} will be shown here.</div>;
const ProjectsView = ({ courseTitle }: { courseTitle: string }) => <div className="p-8 text-center">Projects for {courseTitle} will be shown here.</div>;


const CoursePage = () => {
    const router = useRouter();
    const params = useParams();
    const { courseId } = params;
    const [theme, setTheme] = useState(false);

    // Page State
    const [courseData, setCourseData] = useState<any>(null);
    const [activeTopic, setActiveTopic] = useState<{ topicTitle: string, subtopicTitle: string } | null>(null);
    const [content, setContent] = useState<{ theory: string; youtube: string; image?: string; aiExplanation?: string; }>({ theory: '', youtube: '' });
    const [loading, setLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    
    // UI State
    const [view, setView] = useState<'content' | 'quiz' | 'projects'>('content');
    const [isChatOpen, setIsChatOpen] = useState(false);

    // Progress State
    const [percentage, setPercentage] = useState(0);

    // Chat State
    const [messages, setMessages] = useState<{ text: string; sender: 'bot' | 'user' }[]>([]);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        const darkMode = sessionStorage.getItem("darkMode") === "true";
        setTheme(darkMode);
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

        const completionPercentage = totalTopics > 0 ? Math.round((doneCount / totalTopics) * 100) : 0;
        setPercentage(completionPercentage);
    }, [courseData]);

    const handleSelectSubtopic = (topicTitle: string, subtopicTitle: string) => {
        setActiveTopic({ topicTitle, subtopicTitle });
        setView('content');
    };

    const generateContentForSubtopic = useCallback(async (topicTitle: string, subtopicTitle: string) => {
        setIsGenerating(true);
        try {
            const response = await axiosInstance.post(`/api/courses/generate-content`, { courseId, topicTitle, subtopicTitle });
            // Fix: assert the response type
            const data = response.data as { success: boolean; course?: any; message?: string };

            if (data.success) {
                const updatedCourse = data.course;
                const parsedContent = JSON.parse(updatedCourse.content);
                setCourseData({ ...updatedCourse, content: parsedContent });
            } else {
                toast.error(data.message || "Failed to generate content.");
            }
        } catch (error) {
            toast.error("Failed to generate content.");
        } finally {
            setIsGenerating(false);
        }
    }, [courseId]);
    
    // Fetch initial course data
    useEffect(() => {
        if (courseId) {
            const fetchCourse = async () => {
                setLoading(true);
                try {
                    const response = await axiosInstance.get(`/api/courses/${courseId}`);
                    const data = response.data;
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
                    router.push('/home');
                } finally {
                    setLoading(false);
                }
            };
            fetchCourse();
        }
    }, [courseId, router]);

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
        if(courseData?.mainTopic) {
            const defaultMessage = { text: `Hey there! I'm your AI teacher. Ask me anything about ${courseData.mainTopic}.`, sender: 'bot' as const };
            setMessages([defaultMessage]);
        }
    }, [courseData?.mainTopic]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const userMessage = { text: newMessage, sender: 'user' as const };
        setMessages(prev => [...prev, userMessage]);
        setNewMessage('');

        try {
            const response = await axiosInstance.post('/api/ai/chat', { prompt: userMessage.text });
            const botMessage = { text: response.data.text, sender: 'bot' as const };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            const errorMessage = { text: "Sorry, I couldn't get a response. Please try again.", sender: 'bot' as const };
            setMessages(prev => [...prev, errorMessage]);
        }
    };
    
    if (loading || !courseData) {
        return <div className="flex justify-center items-center h-screen dark:bg-black"><AiOutlineLoading className="h-12 w-12 animate-spin text-black dark:text-white" /></div>;
    }

    const mainTopicKey = courseData.mainTopic.toLowerCase();
    const topics = courseData.content[mainTopicKey];
    
    return (
        <div className="flex flex-col min-h-screen">
            <Header isHome={true} />
            <div className="flex-1 flex dark:bg-gray-900">
                <CourseSidebar
                    topics={topics}
                    mainTopic={courseData.mainTopic}
                    onSelectSubtopic={handleSelectSubtopic}
                    onShowQuiz={() => setView('quiz')}
                    onShowProjects={() => setView('projects')}
                    activeSubtopic={view === 'content' ? activeTopic?.subtopicTitle || null : null}
                />
                
                {/* UPDATED: Removed overflow-y-auto from here */}
                <main className="flex-1 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold capitalize text-black dark:text-white">
                            {courseData.mainTopic}
                        </h1>
                        <CircularProgressBar percentage={percentage} isDarkMode={theme} />
                    </div>

                    {isGenerating ? (
                        <div className="flex justify-center items-center h-full">
                            <AiOutlineLoading className="h-12 w-12 animate-spin text-black dark:text-white" />
                            <p className="ml-4 text-black dark:text-white">Generating content, please wait...</p>
                        </div>
                    ) : (
                        <>
                            {view === 'content' && activeTopic && (
                                <div>
                                    <h2 className="text-3xl font-bold mb-4 text-black dark:text-white">{activeTopic.subtopicTitle}</h2>
                                    {content.youtube && (
                                        <div className="mb-6 rounded-lg overflow-hidden">
                                            <YouTube videoId={content.youtube} opts={{ width: '100%', height: '500' }} />
                                        </div>
                                    )}
                                    {content.image && !content.youtube && (
                                        <div className="mb-6">
                                            <img src={content.image} alt={activeTopic.subtopicTitle} className="w-full h-auto max-h-[500px] object-contain rounded-lg" />
                                        </div>
                                    )}
                                    <MarkdownRenderer content={content.theory || ''} />
                                </div>
                            )}
                            {view === 'quiz' && <QuizView courseTitle={courseData.mainTopic} />}
                            {view === 'projects' && <ProjectsView courseTitle={courseData.mainTopic} />}
                        </>
                    )}
                </main>

                <button
                  onClick={() => setIsChatOpen(true)}
                  className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-blue-600 text-white rounded-full flex justify-center items-center shadow-lg hover:bg-blue-700 transition"
                >
                  <IoChatbubbleEllipses size={30} />
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
            <Footers />
        </div>
    );
};

export default CoursePage;