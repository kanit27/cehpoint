// app/components/course/Quiz.tsx
"use client";

import React, { useState } from "react";
import { AiOutlineLoading } from "react-icons/ai";
import axiosInstance from "../../../lib/axios";
import { toast } from "react-toastify";

interface QuizProps {
  courseTitle: string;
  courseId: string;
  userId: string;
}

const Quiz: React.FC<QuizProps> = ({ courseTitle, courseId, userId }) => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [answerSaved, setAnswerSaved] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  const fetchQuiz = async () => {
    setLoading(true);
    try {
      // Call the new dynamic quiz generation endpoint
      const response = await axiosInstance.post<{
        success: boolean;
        questions: any[];
        message?: string;
      }>("/api/quiz/generate", { courseId });
      
      if (response.data.success) {
        setQuestions(response.data.questions);
      } else {
        toast.error(response.data.message || "Failed to generate quiz questions.");
      }
    } catch (error) {
      toast.error("An error occurred while creating the quiz. Please try again.");
      console.error("Error fetching quiz:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = () => {
    fetchQuiz();
    setQuizStarted(true);
  };

  const handleAnswerSelection = (index: number) => {
    if (!answerSaved) {
      setSelectedAnswer(index);
    }
  };

  const handleSaveAnswer = () => {
    if (selectedAnswer === null) {
      toast.warn("Please select an answer.");
      return;
    }
    const correctAnswer = questions[currentQuestion]?.answer;
    if (questions[currentQuestion]?.options[selectedAnswer] === correctAnswer) {
      setScore((prev) => prev + 1);
    }
    setAnswerSaved(true);
  };

  const handleNext = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setAnswerSaved(false);
    } else {
      try {
        // The route to save results is now /api/quiz
        await axiosInstance.post('/api/quiz', { userId, courseId, score });
        toast.success(`Quiz finished! Your score is ${score}.`);
      } catch {
        toast.error("There was an error saving your quiz score.");
      }
      setQuizFinished(true);
    }
  };
  
  const getOptionClassName = (index: number) => {
    if (!answerSaved) {
      return selectedAnswer === index ? "bg-blue-500 text-white" : "bg-gray-100 dark:bg-gray-700";
    }
    const correctAnswer = questions[currentQuestion]?.answer;
    const isCorrect = questions[currentQuestion]?.options[index] === correctAnswer;
    if (isCorrect) return "bg-green-500 text-white";
    if (selectedAnswer === index) return "bg-red-500 text-white";
    return "bg-gray-100 dark:bg-gray-700";
  };

  if (!quizStarted) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-4">Ready to test your knowledge?</h2>
        <p className="mb-6 text-gray-600 dark:text-gray-400">A quiz will be generated based on the topics you have completed.</p>
        <button onClick={handleStartQuiz} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold">
          Start Quiz
        </button>
      </div>
    );
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64"><AiOutlineLoading className="h-12 w-12 animate-spin" /></div>;
  }
  
  if (quizFinished) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-4">Quiz Complete!</h2>
        <p className="text-xl">Your final score is: {score} / {questions.length}</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      {questions.length > 0 ? (
        <>
          <div className="mb-4 text-right font-bold">Score: {score}</div>
          <h2 className="text-xl font-bold mb-6">{currentQuestion + 1}. {questions[currentQuestion].question}</h2>
          <div className="space-y-3">
            {questions[currentQuestion].options.map((option: string, index: number) => (
              <div
                key={index}
                onClick={() => handleAnswerSelection(index)}
                className={`p-4 rounded-lg cursor-pointer transition-colors ${getOptionClassName(index)}`}
              >
                {option}
              </div>
            ))}
          </div>
          <div className="mt-8 flex justify-end gap-4">
            {!answerSaved && <button onClick={handleSaveAnswer} className="px-6 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg">Save Answer</button>}
            {answerSaved && <button onClick={handleNext} className="px-6 py-2 bg-blue-600 text-white rounded-lg">Next</button>}
          </div>
        </>
      ) : (
        <div className="text-center p-8">
            <p>Could not load quiz questions. Please try starting again.</p>
        </div>
      )}
    </div>
  );
};

export default Quiz;