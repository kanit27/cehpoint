import { NextRequest, NextResponse } from "next/server";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.API_KEY || "");

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

export async function POST(req: NextRequest) {
  const { prompt, useUserApiKey, userApiKey } = await req.json();

  try {
    let model;
    if (useUserApiKey && userApiKey) {
      const genAIuser = new GoogleGenerativeAI(userApiKey);
      model = genAIuser.getGenerativeModel({
        model: "gemini-2.0-flash",
        safetySettings,
      });
    } else {
      model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", safetySettings });
    }

    const result = await model.generateContent(prompt);
    const generatedText = result.response.text();
    return NextResponse.json({ generatedText });
  } catch (error: any) {
    console.error("Error in handlePrompt:", error);
    if (error.message.includes("API_KEY_INVALID")) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid API key",
          error:
            "The provided API key is invalid or has expired. Please check your API key and try again.",
        },
        { status: 400 }
      );
    } else if (error.message.includes("PERMISSION_DENIED")) {
      return NextResponse.json(
        {
          success: false,
          message: "Permission denied",
          error:
            "The API key doesn't have permission to access this resource. Please check your API key permissions.",
        },
        { status: 403 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Internal server error",
          error: error.message,
        },
        { status: 500 }
      );
    }
  }
}