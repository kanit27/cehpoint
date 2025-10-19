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
  const { prompt } = await req.json();

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      safetySettings,
    });
    const result = await model.generateContent(
      `Generate project suggestions based on: ${prompt}`
    );
    const suggestions = result.response
      .text()
      .split("\n")
      .filter((suggestion) => suggestion.trim() !== "");
    return NextResponse.json({ suggestions });
  } catch (error: any) {
    console.error("Error generating project suggestions:", error);
    return NextResponse.json(
      { success: false, message: "Error generating project suggestions" },
      { status: 500 }
    );
  }
}