// app/create/page.tsx
'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import Footers from "../../components/Footers";
import axiosInstance from "../../../lib/axios";
import { toast } from "react-toastify";
import { AiOutlineLoading } from "react-icons/ai";

interface FormValue {
  sub: string;
  subtopic?: string;
}

const CreatePage: React.FC = () => {
  const router = useRouter();
  const maxSubtopics = 5;
  const maxCoursesPerDay = 5;

  const [formValues, setFormValues] = useState<FormValue[]>([{} as FormValue]);
  const [processing, setProcessing] = useState(false);
  const [selectedType, setSelectedType] = useState("Video & Text Course");
  const [coursesCreatedToday, setCoursesCreatedToday] = useState(0);
  const [topic, setTopic] = useState("");
  const [lang, setLang] = useState("English");
  
  const maxTopicLength = 30;
  const maxSubTopicLength = 50;

  useEffect(() => {
    const today = new Date().toDateString();
    const lastReset = sessionStorage.getItem("lastReset");
    const coursesCreated = parseInt(sessionStorage.getItem("coursesCreatedToday") || "0");

    if (!lastReset || new Date(parseInt(lastReset)).toDateString() !== today) {
      sessionStorage.setItem("coursesCreatedToday", "0");
      sessionStorage.setItem("lastReset", new Date().getTime().toString());
      setCoursesCreatedToday(0);
    } else {
      setCoursesCreatedToday(coursesCreated);
    }
  }, []);

  const addFormFields = () => {
    if (formValues.length < maxSubtopics) {
      setFormValues([...formValues, {} as FormValue]);
    } else {
      toast.warn("You can only add 5 subtopics");
    }
  };

  const removeFormFields = () => {
    if (formValues.length > 1) {
      const newFormValues = [...formValues];
      newFormValues.pop();
      setFormValues(newFormValues);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProcessing(true);

    const subtopics = formValues
      .map((fv) => fv.subtopic?.trim())
      .filter((st): st is string => !!st);

    if (!topic.trim() || subtopics.length === 0) {
      setProcessing(false);
      toast.error("Please fill in all required fields");
      return;
    }

    if (coursesCreatedToday >= maxCoursesPerDay) {
        toast.error(`You have exceeded the daily limit of ${maxCoursesPerDay} courses.`);
        router.push('/profile');
        setProcessing(false);
        return;
    }
    
    // Logic to call the backend API to generate the course outline
    try {
        const prompt = `Generate a structured course outline for "${topic}" with a focus on these subtopics: ${subtopics.join(", ")}. The output must be a valid JSON object.`;
        
        const response = await axiosInstance.post('/api/prompt', { prompt });
        const generatedText = (response.data as { generatedText: string }).generatedText;
        
        const cleanedJsonString = generatedText.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsedJson = JSON.parse(cleanedJsonString);

        sessionStorage.setItem('jsonData', JSON.stringify(parsedJson));
        sessionStorage.setItem('mainTopic', topic.toLowerCase());
        sessionStorage.setItem('courseType', selectedType.toLowerCase());
        sessionStorage.setItem('courseLang', lang);

        // Update course creation count
        const newCount = coursesCreatedToday + 1;
        setCoursesCreatedToday(newCount);
        sessionStorage.setItem("coursesCreatedToday", newCount.toString());

        router.push('/topics');

    } catch (error) {
        console.error("Error generating course outline:", error);
        toast.error("Failed to generate course. Please try again.");
    } finally {
        setProcessing(false);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <Header isHome={true} />
      <div className="dark:bg-black flex-1">
        <div className="flex-1 flex items-center justify-center py-10">
          <form onSubmit={handleSubmit} className="max-w-lg m-auto p-4 no-scrollbar">
            <h2 className="text-center font-black text-4xl text-black dark:text-white">Generate Course</h2>
            <p className="text-center font-normal text-black py-4 dark:text-white">
              Type the topic and subtopics on which you want to generate a course.
            </p>
            
            {/* Form Inputs */}
            <div className="py-6">
                {/* Topic Input */}
                <div className="mb-6">
                    <label className="font-bold text-black dark:text-white" htmlFor="topic1">Topic</label>
                    <div className="relative">
                        <input
                            id="topic1"
                            type="text"
                            maxLength={maxTopicLength}
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="focus:ring-black focus:border-black border border-black font-normal bg-white rounded-none block w-full dark:bg-black dark:border-white dark:text-white pr-20"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">{maxTopicLength - topic.length} left</span>
                    </div>
                </div>

                {/* Subtopic Inputs */}
                <div className="mb-6">
                    <label className="font-bold text-black dark:text-white">Subtopics</label>
                    {formValues.map((element, index) => (
                        <div key={index} className="relative mb-2">
                            <input
                                type="text"
                                name="subtopic"
                                value={element.subtopic || ""}
                                maxLength={maxSubTopicLength}
                                onChange={(e) => {
                                    const newFormValues = [...formValues];
                                    newFormValues[index].subtopic = e.target.value;
                                    setFormValues(newFormValues);
                                }}
                                className="focus:ring-black focus:border-black border border-black font-normal bg-white rounded-none block w-full dark:bg-black dark:border-white dark:text-white pr-20"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">{maxSubTopicLength - (element.subtopic?.length || 0)} left</span>
                        </div>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 mb-6">
                    <button type="button" onClick={addFormFields} className="flex-1 text-center bg-black text-white font-bold rounded-none py-2 dark:bg-white dark:text-black">Add Subtopic</button>
                    {formValues.length > 1 && (
                        <button type="button" onClick={removeFormFields} className="flex-1 text-center border border-black bg-white text-black font-bold rounded-none py-2 dark:bg-black dark:text-white dark:border-white">Remove</button>
                    )}
                </div>
                
                {/* Language Select */}
                <div className="mb-6">
                    <label className="font-bold text-black dark:text-white" htmlFor="language">Language</label>
                    <select
                        id="language"
                        value={lang}
                        onChange={(e) => setLang(e.target.value)}
                        className="focus:ring-black focus:border-black border border-black font-normal bg-white rounded-none block w-full dark:bg-black dark:border-white dark:text-white"
                    >
                        <option>English</option>
                        <option>Hindi</option>
                        <option>Bengali</option>
                    </select>
                </div>
                
                {/* Course Type Radio */}
                <fieldset className="mb-6">
                    <legend className="font-bold text-black dark:text-white mb-2">Course Type</legend>
                    <div className="flex items-center p-3 border border-black dark:border-white">
                        <input
                            type="radio"
                            id="videocourse"
                            name="courseType"
                            value="Video & Text Course"
                            checked={selectedType === "Video & Text Course"}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="text-black focus:ring-black"
                        />
                        <label htmlFor="videocourse" className="ml-2 font-bold text-black dark:text-white">Video & Theory Course</label>
                    </div>
                </fieldset>
                
                <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-3 flex items-center justify-center text-center bg-black text-white font-bold rounded-none dark:bg-white dark:text-black disabled:opacity-50"
                >
                    {processing ? <AiOutlineLoading className="h-6 w-6 animate-spin" /> : "Submit"}
                </button>
            </div>
          </form>
        </div>
      </div>
      <Footers />
    </div>
  );
};

export default CreatePage;