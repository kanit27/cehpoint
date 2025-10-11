// src/app/(pages)/topics/page.tsx
'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import Footers from "../../components/Footers";
import axiosInstance from "../../../lib/axios";
import { toast } from "react-toastify";
import { AiOutlineLoading } from "react-icons/ai";

const TopicsPage: React.FC = () => {
    const router = useRouter();
    const [jsonData, setJsonData] = useState<any>(null);
    const [mainTopic, setMainTopic] = useState("");
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const data = sessionStorage.getItem('jsonData');
        const topic = sessionStorage.getItem('mainTopic');
        if (data && topic) {
            setJsonData(JSON.parse(data));
            setMainTopic(topic);
        } else {
            router.push('/create');
        }
    }, [router]);

    const handleGenerateCourse = async () => {
        setProcessing(true);
        try {
            const courseData = {
                user: sessionStorage.getItem('uid'),
                content: JSON.stringify(jsonData),
                type: 'Video & Text Course',
                mainTopic: mainTopic,
                lang: sessionStorage.getItem('courseLang')
            };
            
            const response = await axiosInstance.post('/api/courses/create', courseData);
            const data = response.data as { success: boolean; courseId?: string };

            if (data.success) {
                toast.success("Course saved! You can now view it.");
                if (data.courseId) {
                    sessionStorage.setItem("courseId", data.courseId);
                    router.push(`/course/${data.courseId}`);
                }
            } else {
                toast.error("Failed to save the course structure.");
            }
        } catch (error: any) {
            console.error("Error saving course:", error);
            toast.error(error.response?.data?.message || "An error occurred while saving the course.");
        } finally {
            setProcessing(false);
        }
    };
    
    if (!jsonData) return <div className="dark:bg-black text-white text-center p-10">Loading...</div>;

    return (
        <div className="flex flex-col min-h-screen">
            <Header isHome={true} />
            <main className="dark:bg-black flex-1 py-10">
                <div className="max-w-2xl mx-auto px-4">
                    <h1 className="text-4xl text-black font-black text-center dark:text-white uppercase">{mainTopic}</h1>
                    <p className="text-center font-bold mt-2 text-base text-black dark:text-white">
                        Here is the generated outline for your course:
                    </p>
                    
                    <div className="mt-8">
                        {jsonData[mainTopic]?.map((topic: any) => (
                            <div key={topic.title} className="mb-6">
                                <h3 className="w-full text-white bg-black px-4 py-2 font-bold text-lg dark:bg-white dark:text-black rounded-t-md">
                                    {topic.title}
                                </h3>
                                <div className="border border-t-0 border-gray-300 dark:border-gray-700 rounded-b-md">
                                    {topic.subtopics.map((subtopic: any) => (
                                        <p className="bg-white dark:bg-gray-800 px-4 py-2 border-b dark:border-gray-700 font-normal text-sm text-black dark:text-white last:border-b-0" key={subtopic.title}>
                                            {subtopic.title}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-4 mt-10">
                        <button onClick={() => router.push('/create')} className="flex-1 py-3 text-center border border-black dark:border-white text-black dark:text-white font-bold rounded-md">
                            Go Back
                        </button>
                        <button onClick={handleGenerateCourse} disabled={processing} className="flex-1 py-3 flex items-center justify-center bg-black text-white font-bold rounded-md dark:bg-white dark:text-black disabled:opacity-50">
                            {processing ? <AiOutlineLoading className="h-6 w-6 animate-spin" /> : "Save and View Course"}
                        </button>
                    </div>
                </div>
            </main>
            <Footers />
        </div>
    );
};

export default TopicsPage;