// app/api/quiz/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../lib/db";
import Course from "../../../../lib/models/Course";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.API_KEY || "");

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const { courseId } = await req.json();
    if (!courseId) {
      return NextResponse.json({ success: false, message: "Course ID is required" }, { status: 400 });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ success: false, message: "Course not found" }, { status: 404 });
    }

    const content = JSON.parse(course.content);
    const mainTopicKey = course.mainTopic.toLowerCase();
    
    // Filter out only the subtopics that the user has completed
    const completedSubtopics: string[] = [];
    content[mainTopicKey]?.forEach((topic: any) => {
      topic.subtopics?.forEach((subtopic: any) => {
        if (subtopic.done) {
          completedSubtopics.push(subtopic.title);
        }
      });
    });

    if (completedSubtopics.length === 0) {
      return NextResponse.json({ success: false, message: "No topics have been completed yet." }, { status: 400 });
    }

    // Construct the dynamic prompt
    const prompt = `Generate a 10-question multiple-choice quiz for the course "${course.mainTopic}". The user has only completed the following topics: ${completedSubtopics.join(", ")}. 
    
    Please ensure ALL questions are based ONLY on these topics.
    
    Format the response as a valid JSON array of objects. Each object must have a "question" (string), "options" (array of 4 strings), and "answer" (string that matches one of the options).`;
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", safetySettings });
    const result = await model.generateContent(prompt);
    const rawText = result.response.text();
    const cleanedJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const questions = JSON.parse(cleanedJson);

    return NextResponse.json({ success: true, questions });

  } catch (error) {
    console.error("Error generating dynamic quiz:", error);
    return NextResponse.json({ success: false, message: "Failed to generate quiz questions" }, { status: 500 });
  }
}