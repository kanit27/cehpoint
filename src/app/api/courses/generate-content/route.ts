// src/app/api/courses/generate-content/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Course from '@/lib/models/Course';
import { GoogleGenerativeAI } from '@google/generative-ai';
import youtubesearchapi from 'youtube-search-api';
import { compareTwoStrings } from 'string-similarity';
import axios from 'axios';

// Note: We no longer need showdown here
const genAI = new GoogleGenerativeAI(process.env.API_KEY || "");

export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const { courseId, topicTitle, subtopicTitle } = await req.json();
    const course = await Course.findById(courseId);
    if (!course) return NextResponse.json({ success: false, message: "Course not found" }, { status: 404 });

    const mainTopicKey = course.mainTopic.toLowerCase();
    let content = JSON.parse(course.content);

    const topic = content[mainTopicKey]?.find((t: any) => t.title === topicTitle);
    if (!topic) return NextResponse.json({ success: false, message: "Topic not found" }, { status: 404 });

    const subtopic = topic.subtopics?.find((st: any) => st.title === subtopicTitle);
    if (!subtopic) return NextResponse.json({ success: false, message: "Subtopic not found" }, { status: 404 });

    // --- 1. Generate YouTube Video (in a safe block) ---
    try {
      const videoResults = await youtubesearchapi.GetListByKeyword(`${subtopicTitle} tutorial ${topicTitle}`, false, 5, [{ type: "video" }]);
      if (videoResults.items.length > 0) {
          const videoData = videoResults.items.map((video: any) => ({ id: video.id, title: video.title }));
          const similarities = videoData.map((video: any) => ({ ...video, similarity: compareTwoStrings(`${subtopicTitle} ${topicTitle}`, video.title) }));
          const mostRelevantVideo = similarities.reduce((prev: any, current: any) => (current.similarity > prev.similarity ? current : prev));
          subtopic.youtube = mostRelevantVideo.id;
      } else {
          subtopic.youtube = '';
      }
    } catch (videoError) {
        console.error("YouTube search failed:", videoError);
        subtopic.youtube = '';
    }
    
    // --- 2. Generate Theory with the NEW Markdown-focused prompt ---
    try { 
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const prompt = `You are an expert instructor and senior developer creating a lesson for a course.
      Your task is to provide a comprehensive, clear, and easy-to-follow explanation for the subtopic: "${subtopicTitle}", which is part of the larger topic: "${topicTitle}".

      Your response MUST be formatted in well-structured Markdown and follow this exact lesson plan:

      1.  **Introduction (## What is ${subtopicTitle}?)**
          * Start with a brief, high-level overview.
          * Use a simple analogy to explain the core concept to a beginner.

      2.  **Importance (## Why is it Important?)**
          * Explain the problem this concept solves or why a developer should learn it.
          * Provide 2-3 key benefits in a bulleted list.

      3.  **Core Concepts / How it Works (## Core Concepts)**
          * Break down the topic into its most important parts.
          * Use '###' subheadings for each distinct part.
          * Use **bold text** to highlight key terminology.
          * Use backticks (\`) for inline code, package names, or commands (e.g., \`firebase auth\`).

      4.  **Practical Code Example (## Practical Code Example)**
          * Provide a clear, concise, and well-commented code block.
          * Use triple backticks with the correct language identifier (e.g., \`\`\`javascript or \`\`\`jsx).
          * Follow the code block with a brief explanation of what the code is doing.

      5.  **Key Takeaways (## Key Takeaways)**
          * Summarize the most critical points of the lesson in a bulleted list. This should be a quick review for the student.

      CRITICAL: Do not include a main title for the entire document. The first line of your response must be the "## What is..." heading. Ensure the total length is at least 400 words to provide sufficient detail.`;

      const theoryResult = await model.generateContent(prompt);
      // We now save the raw markdown text directly
      subtopic.theory = theoryResult.response.text();
    } catch (aiError) {
        console.error("AI content generation failed:", aiError);
        subtopic.theory = "### Error\nSorry, the AI could not generate content for this topic. Please try again later.";
    }
    
    subtopic.done = true;
    course.content = JSON.stringify(content);
    await course.save();

    // Return the updated course object directly
    return NextResponse.json({ success: true, course });
  } catch (error: any) {
    console.error("Overall error in generate-content:", error);
    return NextResponse.json({ success: false, message: "An error occurred while generating content" }, { status: 500 });
  }
}