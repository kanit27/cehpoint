// app/api/prompt/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Initialize the Google AI client with the key from your environment variables
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_API_KEY || "");

// Define safety settings for the AI model
const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

export async function POST(req: NextRequest) {
  try {
    const { prompt, useUserApiKey, userApiKey } = await req.json();

    let activeGenAI = genAI;

    // If a user-specific API key is provided, use it
    if (useUserApiKey && userApiKey) {
      activeGenAI = new GoogleGenerativeAI(userApiKey);
    }

    const model = activeGenAI.getGenerativeModel({ model: "gemini-1.5-flash", safetySettings });

    const result = await model.generateContent(prompt);
    const generatedText = result.response.text();

    return NextResponse.json({ generatedText }, { status: 200 });

  } catch (error: any) {
    console.error("Error in /api/prompt:", error);
    // Provide a more detailed error response
    return NextResponse.json({
        success: false,
        message: "Internal server error",
        error: error.message
    }, { status: 500 });
  }
}