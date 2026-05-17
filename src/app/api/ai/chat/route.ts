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

function cleanResponse(text: string): string {
  let cleaned = text;

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

  const patterns = [
    /(The user is asking|User asks)\s*[:\s]*('.*?'|".*?"?)\s*/gim,
    /\(thinking.*?\)/gi,
    /^\d+ (sentence|sentences)\. Perfect\.$/gim,
    /^\* (Output ONLY the answer|Answer directly in.*|Stop immediately.*).*$/gim,
    /\*\*(Question|Constraint|Draft \d+|Refined Draft|Final Polish)\*\*:\s*/gim,
  ];

  for (const pattern of patterns) {
    cleaned = cleaned.replace(pattern, "");
  }

  const lines = cleaned.split('\n');
  const filteredLines = lines.filter(line => {
    const t = line.trim();
    if (!t) return false;
    if (/^(Topic|Constraint|Role|Format|Goal|Context|Instructions?|Draft \d+|Refined Draft|Final Polish):/i.test(t)) return false;
    if (/^\*\s*(Constraint|Role|Format|Goal|Context|Instructions?|Output ONLY|Answer directly|Stop immediately|Definition|Common form|Rights|Risk\/Reward|Key|Example|Note|Tip|Warning):/i.test(t)) return false;
    if (/^\*\s+[A-Z][a-z]+:/i.test(t)) return false;
    return true;
  });
  cleaned = filteredLines.join('\n');

  cleaned = cleaned.replace(/^\s*\*+\s*/gm, "");

  const paras = cleaned.split(/\n\s*\n/);
  const seen = new Set<string>();
  const unique = paras.filter(p => {
    const n = p.trim().toLowerCase();
    if (!n) return false;
    if (seen.has(n)) return false;
    seen.add(n);
    return true;
  });
  cleaned = unique.join('\n\n');

  return cleaned.trim();
}

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  try {
    const model = genAI.getGenerativeModel({
      model: "gemma-4-26b-a4b-it",
      safetySettings,
      generationConfig: {
        maxOutputTokens: 512,
        temperature: 0.5,
      },
      systemInstruction: "You are a professional AI teacher. Answer directly with the final, concise, factual response. NEVER include: internal monologue, thinking process, 'Question:', 'Constraint:', 'Topic:', 'Role:', 'Format:', 'Goal:', 'Context:', drafting steps, 'Draft 1:', 'Refined Draft:', 'Final Polish:', or any preamble that echoes the user's request or the instruction itself. Do not repeat constraints. Do not announce what you are going to do. Start immediately with the answer. Output ONLY the final answer and nothing else.",
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