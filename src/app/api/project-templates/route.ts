// src/app/api/project-templates/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/db";
import ProjectTemplate from "../../../lib/models/ProjectTemplate";
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
        const { mainTopic } = await req.json();

        // 1. Fetch existing project templates to evaluate
        const existingProjects = await ProjectTemplate.find().limit(15);
        
        const evaluationModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash", safetySettings });

        // 2. Create a prompt to ask the AI to evaluate the projects
        const evaluationPrompt = `
            I have a set of project ideas and a topic of interest: "${mainTopic}". 
            Evaluate how relevant each project is to this topic on a scale of 0-10.
            Give a high score (7+) ONLY if a project's technologies or domain DIRECTLY match the topic.
            Give a low score (0-3) for any project that uses unrelated technologies.
            Here are the projects:
            ${existingProjects.map((p, i) => `Project ${i}: Title: ${p.title}, Category: ${p.category}`).join('\n')}
            Respond in valid JSON format: { "evaluations": [{ "projectIndex": 0, "score": 8 }, ...] }`;

        const evaluationResult = await evaluationModel.generateContent(evaluationPrompt);
        const evaluationResponse = evaluationResult.response.text();
        
        let evaluations = [];
        try {
            const match = evaluationResponse.match(/\{[\s\S]*\}/);
            if (match) {
                evaluations = JSON.parse(match[0]).evaluations;
            }
        } catch (e) { console.error("Could not parse AI evaluation response."); }

        // 3. Filter for highly relevant projects
        const relevantProjects = evaluations
            .filter((e: any) => e.score >= 7)
            .map((e: any) => existingProjects[e.projectIndex]);
        
        if (relevantProjects.length >= 3) {
            return NextResponse.json({ success: true, data: relevantProjects });
        }

        // 4. If not enough relevant projects, generate new ones
        const generationModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash", safetySettings });
        const generationPrompt = `Generate 5 industry-relevant hands-on projects for the topic: "${mainTopic}".
            CRITICAL: Projects MUST ONLY use technologies EXPLICITLY mentioned in the topic.
            Format the entire response as a valid JSON array of objects, where each object has:
            "title", "category", "description", "difficulty" (Beginner, Intermediate, or Advanced), "timeEstimate" (e.g., "3-7 days"),
            "learningObjectives" (array of strings), "deliverables" (array of strings), and "realWorldApplication" (string).`;
            
        const generationResult = await generationModel.generateContent(generationPrompt);
        const generationResponse = generationResult.response.text();
        const cleanedJson = generationResponse.replace(/```json/g, "").replace(/```/g, "").trim();
        const generatedProjects = JSON.parse(cleanedJson);

        // 5. Save the newly generated projects for future use (optional but recommended)
        await ProjectTemplate.insertMany(generatedProjects, { ordered: false }).catch(() => {
            console.log("Some generated projects might already exist, which is okay.");
        });

        return NextResponse.json({ success: true, data: generatedProjects });

    } catch (error: any) {
        console.error("Error in project-templates route:", error);
        return NextResponse.json({ success: false, message: "Internal server error", error: error.message }, { status: 500 });
    }
}