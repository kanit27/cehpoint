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

// Helper function to clean response and remove thinking/verbose parts
function cleanResponse(text: string): string {
  let cleaned = text;

  // 1. Search for the last occurrence of a "final" marker to isolate the actual answer.
  const finalMarkers = ["Final Polish:", "Answer:", "Assistant:"];
  let lastMarkerIndex = -1;
  let lastMarkerLength = 0;

  for (const marker of finalMarkers) {
    const index = cleaned.lastIndexOf(marker);
    if (index > lastMarkerIndex) {
      lastMarkerIndex = index;
      lastMarkerLength = marker.length;
    }
  }

  if (lastMarkerIndex !== -1) {
    cleaned = cleaned.substring(lastMarkerIndex + lastMarkerLength);
  }

  // 2. Remove common thinking patterns and meta-commentary.
  const patterns = [
    // Matches "The user is asking '...'" or "User asks: '...'"
    /(The user is asking|User asks)\s*[:\s]*('.*?'|".*?")?\s*/gim,
    
    // Matches markers like "Question:", "Constraint:", "Draft 1:", "Refined Draft:"
    // only matching the label and potential quoted value, not the whole line
    /\(thinking.*?\)/gi,
    /^\d+ (sentence|sentences)\. Perfect\.$/gim,
    /^\* (Output ONLY the answer|Answer directly in.*|Stop immediately.*).*$/gim,
    /\*\*(Question|Constraint|Draft \d+|Refined Draft|Final Polish)\*\*:\s*/gim,
  ];

  patterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, "");
  });

  // 3. Clean up any remaining leading delimiters or artifacts
  cleaned = cleaned.replace(/^\s*\*+\s*/, "");

  return cleaned.trim();
}

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  try {
    const model = genAI.getGenerativeModel({
      model: "gemma-4-26b-a4b-it",
      safetySettings,
      systemInstruction: "You are a professional AI teacher. Your goal is to provide a direct, concise, and factual answer to the user's question. CRITICAL: Do NOT include any internal monologue, thinking process, 'Question:', 'Constraint:', drafting steps, 'Drafts', or 'Final Polish' sections. Do NOT echo the user's prompt, repeat the constraints, or provide a preamble. Start your response immediately with the direct answer. Only output the final answer and nothing else.",
    });

    const result = await model.generateContent(prompt);
    const txt = result.response.text();
    const cleanedText = cleanResponse(txt);
    const text = converter.makeHtml(cleanedText);
    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("Error in handleChat:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}