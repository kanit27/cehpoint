'use client';

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "../../components/Header";
import Footers from "../../components/Footers";
import axiosInstance from "../../../lib/axios";
import { toast } from "react-toastify";
import { AiOutlineLoading } from "react-icons/ai";

const TopicsPageContent: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
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
            const courseType = sessionStorage.getItem('courseType');
            const lang = sessionStorage.getItem('courseLang');
            const firstTopicTitle = jsonData[mainTopic][0].title;
            const response = await axiosInstance.post('/api/course', {
                user: sessionStorage.getItem('uid'),
                content: JSON.stringify(jsonData),
                type: courseType,
                mainTopic: mainTopic,
                lang: lang
            });

            const data = response.data as { success: boolean; courseId?: string };

            if(data.success){
                toast.success("Course generation started!");
                if (data.courseId) {
                    sessionStorage.setItem("courseId", data.courseId);
                    router.push(`/course?mainTopic=${encodeURIComponent(mainTopic)}&courseId=${data.courseId}`);
                }
            } else {
                 toast.error("Failed to start course generation.");
            }

        } catch (error) {
            toast.error("An error occurred during course generation.");
            console.error(error);
        } finally {
            setProcessing(false);
        }
    };

    if (!jsonData) return <div>Loading...</div>;

    return (
        <div className="h-screen flex flex-col">
            <Header isHome={true} />
            <main className="dark:bg-black flex-1 py-10">
                <div className="max-w-lg mx-auto px-4">
                    <h1 className="text-4xl text-black font-black text-center dark:text-white uppercase">{mainTopic}</h1>
                    <p className="text-center font-bold mt-2 text-base text-black dark:text-white">
                        List of topics and subtopics the course will cover
                    </p>
                    
                    {jsonData[mainTopic]?.map((topic: any) => (
                        <div key={topic.title} className="mt-8">
                            <h3 className="w-full text-white bg-black px-4 py-2 font-black text-lg dark:bg-white dark:text-black">
                                {topic.title}
                            </h3>
                            <div>
                                {topic.subtopics.map((subtopic: any) => (
                                    <p className="w-full border-black border bg-white px-4 py-2 mb-2 font-normal text-sm dark:text-white dark:border-white dark:bg-black" key={subtopic.title}>
                                        {subtopic.title}
                                    </p>
                                ))}
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={handleGenerateCourse}
                        disabled={processing}
                        className="w-full mt-10 py-3 flex items-center justify-center text-center bg-black text-white font-bold rounded-none dark:bg-white dark:text-black disabled:opacity-50"
                    >
                        {processing ? <AiOutlineLoading className="h-6 w-6 animate-spin" /> : "Generate Course"}
                    </button>
                </div>
            </main>
            <Footers />
        </div>
    );
};

const TopicsPage: React.FC = () => (
    <Suspense fallback={<div>Loading...</div>}>
        <TopicsPageContent />
    </Suspense>
);

export default TopicsPage;