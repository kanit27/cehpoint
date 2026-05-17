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
    const prompt = `Generate a 10-question multiple-choice quiz for the course "${course.mainTopic}". 
    The user has only completed the following topics: ${completedSubtopics.join(", ")}. 
    
    CRITICAL REQUIREMENTS:
    1. ALL questions must be based ONLY on the completed topics listed above.
    2. The response must be a VALID JSON array of objects.
    3. Each object MUST have exactly these keys: "question" (string), "options" (array of 4 strings), and "answer" (string).
    4. The "answer" must exactly match one of the strings in the "options" array.
    5. ABSOLUTELY NO PLACEHOLDERS: Do not use ellipses (e.g., "..."), "etc.", or summaries. 
    6. COMPLETE CONTENT: You must write out the full text for every single question and every single option. Do not truncate the list.
    7. NO CONVERSATION: Do not include any introductory or concluding text. Return ONLY the raw JSON array.
    
    Expected JSON format example:
    [
      {
        "question": "What is the primary purpose of a Hypervisor?",
        "options": ["To manage containers", "To create and run virtual machines", "To share the host kernel", "To build images"],
        "answer": "To create and run virtual machines"
      }
    ]`;
    
    const model = genAI.getGenerativeModel({ model: "gemma-4-26b-a4b-it", safetySettings });
    const result = await model.generateContent(prompt);
    const rawText = result.response.text();
    
    // Extract JSON from the response - look for content between [ and ]
    let cleanedJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    // Find the JSON array - locate the first '[' and last ']'
    const jsonStart = cleanedJson.indexOf('[');
    const jsonEnd = cleanedJson.lastIndexOf(']');
    
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleanedJson = cleanedJson.substring(jsonStart, jsonEnd + 1);
    }
    
    try {
      const questions = JSON.parse(cleanedJson);
      return NextResponse.json({ success: true, questions });
    } catch (parseError) {
      console.error("JSON parse error. Cleaned JSON:", cleanedJson);
      console.error("Parse error details:", parseError);
      
      // Fallback: try to extract using regex for more robust parsing
      const jsonMatch = rawText.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (jsonMatch) {
        try {
          const questions = JSON.parse(jsonMatch[0]);
          return NextResponse.json({ success: true, questions });
        } catch (fallbackError) {
          console.error("Fallback parse also failed:", fallbackError);
          throw parseError;
        }
      }
      throw parseError;
    }

  } catch (error) {
    console.error("Error generating dynamic quiz:", error);
    return NextResponse.json({ success: false, message: "Failed to generate quiz questions" }, { status: 500 });
  }
}