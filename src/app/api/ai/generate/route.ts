import { NextRequest, NextResponse } from "next/server";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import showdown from "showdown";

const genAI = new GoogleGenerativeAI(process.env.API_KEY || "");
const converter = new showdown.Converter();

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
    const htmlContent = converter.makeHtml(generatedText);
    return NextResponse.json({ text: htmlContent });
  } catch (error: any) {
    console.error("Error in generateContent:", error);
    return NextResponse.json(
      { success: false, message: "Error in generating" },
      { status: 500 }
    );
  }
}