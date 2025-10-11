// src/app/(pages)/create/page.tsx
'use client';

import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import Footers from "../../components/Footers";
import { AiOutlineLoading } from "react-icons/ai";
import { toast } from "react-toastify";
import axiosInstance from "../../../lib/axios";
import { useRouter } from "next/navigation";

const maxSubtopics = 5;
const maxCoursesPerDay = 5;
const maxTopicLength = 30;
const maxSubTopicLength = 50;

const CreatePage: React.FC = () => {
  const router = useRouter();
  const [formValues, setFormValues] = useState([{ subtopic: "" }]);
  const [processing, setProcessing] = useState(false);
  const [topic, setTopic] = useState("");
  const [lang, setLang] = useState("English");
  const [selectedType, setSelectedType] = useState("Video & Text Course");
  const [coursesCreatedToday, setCoursesCreatedToday] = useState(0);
  const [showApiKeyErrorPopup, setShowApiKeyErrorPopup] = useState(false);
  const [showUpdateKeyPrompt, setShowUpdateKeyPrompt] = useState(false);

  useEffect(() => {
    const today = new Date().toDateString();
    const lastReset = sessionStorage.getItem("lastReset");
    const coursesCreated =
      parseInt(sessionStorage.getItem("coursesCreatedToday") || "0");

    if (!lastReset || new Date(parseInt(lastReset)).toDateString() !== today) {
      sessionStorage.setItem("coursesCreatedToday", "0");
      sessionStorage.setItem("lastReset", new Date().getTime().toString());
      setCoursesCreatedToday(0);
    } else {
      setCoursesCreatedToday(coursesCreated);
    }
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setState: (val: string) => void,
    maxLength: number
  ) => {
    const value = e.target.value.slice(0, maxLength);
    setState(value);
  };

  const handleSubtopicChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value.slice(0, maxSubTopicLength);
    const updatedFormValues = [...formValues];
    updatedFormValues[index].subtopic = value;
    setFormValues(updatedFormValues);
  };

  const addFormFields = () => {
    if (formValues.length < maxSubtopics) {
      setFormValues([...formValues, { subtopic: "" }]);
    } else {
      showToast("You can only add 5 sub topics");
    }
  };

  const removeFormFields = () => {
    let newFormValues = [...formValues];
    newFormValues.pop();
    setFormValues(newFormValues);
  };

  const showToast = (msg: string) => {
    toast(msg, {
      position: "bottom-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLang(e.target.value);
  };

  const handleRadioChangeType = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedType(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProcessing(true);

    const subtopics = formValues
      .map((subtopic) => subtopic.subtopic?.trim())
      .filter(Boolean);

    if (!topic.trim() || subtopics.length === 0) {
      setProcessing(false);
      showToast("Please fill in all required fields");
      return;
    }

    // Daily limit logic
    if (coursesCreatedToday >= maxCoursesPerDay) {
      setShowUpdateKeyPrompt(true);
      setProcessing(false);
      showToast(
        "You have exceeded the daily limit of 5 courses. Please update your API key."
      );
      router.push("/profile");
      return;
    }

    // Prompt for AI
    const prompt = `Generate a structured list of topics for the main title "${topic.toLowerCase()}", designed as a course outline. Arrange each topic to cover progressively advanced concepts in a logical order, starting with foundational knowledge and building up to skills suitable for internships or entry-level job roles. Ensure the required subtopics ${subtopics
      .join(", ")
      .toLowerCase()} appear in this basic-to-advanced flow, even if their complexity varies. Leave the fields "theory", "youtube", "image", and "aiExplanation" empty.

Please output the list in the following valid JSON format strictly in English, with property names enclosed in double quotes and no comments:
{
  "${topic.toLowerCase()}": [
    {
      "title": "Topic Title",
      "subtopics": [
        {
          "title": "Sub Topic Title",
          "theory": "",
          "youtube": "",
          "image": "",
          "done": false,
          "aiExplanation": ""
        }
      ]
    }
  ]
}`;

    try {
      const response = await axiosInstance.post("/api/ai/prompt", { prompt });
      const data = response.data as { generatedText: string };

  const generatedText = data.generatedText;
  const cleanedJsonString = generatedText
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

      try {
        const parsedJson = JSON.parse(cleanedJsonString);
        sessionStorage.setItem("jsonData", JSON.stringify(parsedJson));
        sessionStorage.setItem("mainTopic", topic.toLowerCase());
        sessionStorage.setItem("courseLang", lang);
        sessionStorage.setItem("type", selectedType.toLowerCase());
        sessionStorage.setItem(
          "coursesCreatedToday",
          (coursesCreatedToday + 1).toString()
        );
        router.push("/topics");
      } catch (jsonError) {
        toast.error(
          "The AI returned an invalid format. Please try generating the outline again."
        );
      }
    } catch (error: any) {
      if (
        error.response?.data?.error &&
        (error.response.data.error.includes("invalid") ||
          error.response.data.error.includes("expired"))
      ) {
        setShowApiKeyErrorPopup(true);
      } else {
        toast.error(
          error.response?.data?.message ||
            "Failed to generate course outline. Please try again."
        );
      }
    } finally {
      setProcessing(false);
    }
  };

  // API Key Error Popup
  const ApiKeyErrorPopup = ({
    isVisible,
    onClose,
  }: {
    isVisible: boolean;
    onClose: () => void;
  }) => {
    if (!isVisible) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-sm w-full">
          <h2 className="text-xl font-bold mb-4 text-black dark:text-white text-center">
            Invalid API Key
          </h2>
          <p className="mb-4 text-black dark:text-white text-center">
            Your API key is invalid or has expired. Please update it in your
            profile to continue generating courses.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => router.push("/profile")}
              className="bg-black text-white dark:bg-white dark:text-black font-bold px-4 py-2 rounded"
            >
              Go to Profile
            </button>
            <button
              onClick={onClose}
              className="bg-gray-300 text-black dark:bg-gray-600 dark:text-white font-bold px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col">
      <Header isHome={true} className="sticky top-0 z-50" />

      {showApiKeyErrorPopup && (
        <ApiKeyErrorPopup
          isVisible={showApiKeyErrorPopup}
          onClose={() => setShowApiKeyErrorPopup(false)}
        />
      )}

      <div className="dark:bg-black flex-1">
        <div className="flex-1 flex items-center justify-center py-10">
          <form
            onSubmit={handleSubmit}
            className="max-w-lg m-auto p-4 no-scrollbar"
          >
            <h2 className="text-center font-black text-4xl text-black dark:text-white">
              Generate Course
            </h2>
            <p className="text-center font-normal text-black py-4 dark:text-white">
              Type the topic on which you want to Generate course.
              <br />
              Also, you can enter a list of subtopics, which are the specifics
              you want to learn.
            </p>

            <div className="text-start text-xs bg-gray-100 dark:bg-gray-800/50 text-gray-500 dark:text-gray-300 py-4 w-full p-4 relative">
              <span>
                <p>
                  <strong>Note:</strong> Please keep the main topic simple and
                  to the point. For example, for a React course, write "React",
                  or for topics like MongoDB, Express, React, Node, just use
                  "MERN".
                </p>
                <p>Subtopics can be entered separately, for example:</p>
                <ul className="list-disc list-inside">
                  <li>Main topic - Firebase</li>
                  <li>Sub topic 1 - How to connect with React.js</li>
                  <li>Sub topic 2 - How to update the data</li>
                </ul>
                <p>This helps in creating more efficient results.</p>
              </span>
              <div className="h-4 w-4 rounded-full bg-red-600 animate-pulse absolute -left-1 -top-1"></div>
            </div>

            <div className="py-6">
              <div className="mb-6">
                <label
                  className="font-bold text-black dark:text-white mb-2 block"
                  htmlFor="topic1"
                >
                  Topic
                </label>
                <div className="relative">
                  <input
                    className="focus:ring-black focus:border-black border border-black font-normal bg-white rounded-none block w-full dark:bg-black dark:border-white dark:text-white pr-10"
                    id="topic1"
                    type="text"
                    maxLength={maxTopicLength}
                    value={topic}
                    onChange={(e) =>
                      handleInputChange(e, setTopic, maxTopicLength)
                    }
                  />
                  <span className="absolute right-2 top-2 text-xs text-gray-500 dark:text-gray-300">
                    {maxTopicLength - topic.length} chars left
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <label
                  className="font-bold text-black dark:text-white mb-2 block"
                  htmlFor="subtopic"
                >
                  Sub Topic
                </label>
                {formValues.map((element, index) => (
                  <div key={index} className="relative mb-4">
                    <input
                      className="focus:ring-black focus:border-black border border-black font-normal bg-white rounded-none block w-full dark:bg-black dark:border-white dark:text-white pr-10"
                      id="subtopic"
                      type="text"
                      name="subtopic"
                      value={element.subtopic || ""}
                      maxLength={maxSubTopicLength}
                      onChange={(e) => handleSubtopicChange(index, e)}
                    />
                    <span className="absolute right-2 top-2 text-xs text-gray-500 dark:text-gray-300">
                      {maxSubTopicLength - (element.subtopic || "").length} chars left
                    </span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addFormFields}
                className="mb-6 items-center justify-center text-center dark:bg-white dark:text-black bg-black text-white font-bold rounded-none w-full hover:bg-black focus:bg-black focus:ring-transparent dark:hover:bg-white dark:focus:bg-white dark:focus:ring-transparent py-2"
              >
                Add Sub-Topic
              </button>

              {formValues.length > 1 && (
                <button
                  type="button"
                  onClick={removeFormFields}
                  className="mb-6 items-center justify-center text-center border-black dark:border-white dark:bg-black dark:text-white bg-white text-black font-bold rounded-none w-full hover:bg-white focus:bg-white focus:ring-transparent dark:hover:bg-black dark:focus:bg-black dark:focus:ring-transparent py-2"
                >
                  Remove Sub-Topic
                </button>
              )}

              <div className="mb-6">
                <label
                  className="font-bold text-black dark:text-white mb-2 block"
                  htmlFor="language"
                >
                  Language
                </label>
                <div className="relative">
                  <select
                    className="focus:ring-black focus:border-black border border-black font-normal bg-white rounded-none block w-full dark:bg-black dark:border-white dark:text-white pr-10"
                    id="language"
                    value={lang}
                    onChange={handleLanguageChange}
                  >
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Bengali</option>
                  </select>
                </div>
              </div>

              {showUpdateKeyPrompt && (
                <div className="mb-6 text-center">
                  <p className="text-red-500 dark:text-red-400 mb-5">
                    You have exceeded the daily limit of {maxCoursesPerDay} courses. Please update your API key.
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push("/profile")}
                    className="mb-6 items-center justify-center text-center border-black dark:border-white dark:bg-black dark:text-white bg-white text-black font-bold rounded-none w-full hover:bg-white focus:bg-white focus:ring-transparent dark:hover:bg-black dark:focus:bg-black dark:focus:ring-transparent py-2"
                  >
                    Go to Profile to Update Key
                  </button>
                </div>
              )}

              <fieldset className="flex flex-col gap-4 mt-2">
                <div className="flex items-center gap-2 px-2 h-11 focus:ring-black focus:border-black border border-black font-normal bg-white rounded-none w-full dark:bg-black dark:border-white dark:text-white mb-6">
                  <input
                    type="radio"
                    id="videocourse"
                    name="value1"
                    value="Video & Text Course"
                    checked={selectedType === "Video & Text Course"}
                    onChange={handleRadioChangeType}
                    className="text-black border-black dark:text-white dark:border-white dark:focus:text-black focus:ring-black dark:focus:ring-white dark:focus:bg-black"
                  />
                  <label
                    className="text-black dark:text-white font-bold"
                    htmlFor="videocourse"
                  >
                    Video & Theory Course
                  </label>
                </div>
              </fieldset>

              <button
                type="submit"
                disabled={processing}
                className="items-center justify-center text-center dark:bg-white dark:text-black bg-black text-white font-bold rounded-none w-full hover:bg-black focus:bg-black focus:ring-transparent dark:hover:bg-white dark:focus:bg-white dark:focus:ring-transparent py-3 flex"
              >
                {processing ? <AiOutlineLoading className="h-6 w-6 animate-spin" /> : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <Footers className="sticky bottom-0 z-50" />
    </div>
  );
};

export default CreatePage;