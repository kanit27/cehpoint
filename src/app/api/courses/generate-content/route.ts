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
      const prompt = `You are an expert instructor. Your task is to provide a comprehensive and detailed explanation for the subtopic "${subtopicTitle}", which is part of a larger course on "${topicTitle}".

      Your response MUST be formatted in clear, well-structured Markdown.
      - Use headings (##) for main sections and subheadings (###) for smaller parts.
      - Use backticks (\`) for inline code like package names or commands.
      - Use triple backticks with a language identifier (e.g., \`\`\`bash or \`\`\`jsx) for all code blocks.
      - Use bold text (**) to emphasize key terms.
      - Ensure the explanation is at least 300 words long.

      Do not include a main title; start directly with the content.`;

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