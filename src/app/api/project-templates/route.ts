// src/app/api/project-templates/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/db";
import ProjectTemplate from "../../../lib/models/ProjectTemplate";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const API_KEY = process.env.API_KEY || "";
// treat genAI as any to avoid typing issues from the SDK
const genAI: any = API_KEY ? new (GoogleGenerativeAI as any)(API_KEY) : null;
// safetySettings typed as any[] to satisfy TS
const safetySettings: any[] = [
  { category: HarmCategory?.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold?.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory?.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold?.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory?.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold?.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory?.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold?.BLOCK_MEDIUM_AND_ABOVE },
];

function tryParseJsonFromText(text: string) {
  try {
    const match = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (match) return JSON.parse(match[0]);
  } catch (e) {
    // ignore parse errors
  }
  return null;
}

export async function POST(req: NextRequest) {
  await connectDB();

  try {
    const body = await req.json().catch(() => ({}));
    const mainTopic = (body?.mainTopic || "").toString().trim();

    // fetch some existing templates (lean objects)
    const existingProjects = await ProjectTemplate.find().limit(20).lean().catch(() => []);

    if (!mainTopic) {
      return NextResponse.json({ success: true, data: existingProjects });
    }

    // If AI not available, fallback to simple DB filtering
    if (!genAI) {
      const matches = existingProjects.filter((t: any) =>
        [t.mainTopic, t.title, t.description, t.category, t.technologies].some((f: any) =>
          f && f.toString().toLowerCase().includes(mainTopic.toLowerCase())
        )
      );
      return NextResponse.json({
        success: true,
        data: matches.length ? matches.slice(0, 5) : existingProjects.slice(0, 5),
        note: "AI unavailable, returned DB templates.",
      });
    }

    // Evaluate existing templates via AI — cast model to any for TS safety
    let evaluations: any[] = [];
    try {
      const evaluationModel: any = genAI.getGenerativeModel?.({ model: "gemini-2.0-flash", safetySettings }) || (genAI as any);
      const evalPrompt = `
I have a topic: "${mainTopic}" and a list of projects. For each project return JSON with { "projectIndex": i, "score": 0-10 }.
Projects:
${existingProjects.map((p: any, i: number) => `INDEX:${i} TITLE:${p.title} CATEGORY:${p.category || ""} TECH:${(p.technologies || []).join(",") || ""}`).join("\n")}
Respond ONLY with valid JSON: { "evaluations": [{ "projectIndex": 0, "score": 8 }, ...] }
`;
      const evalResp: any = await evaluationModel.generateContent?.(evalPrompt) ?? await evaluationModel.generate?.(evalPrompt).catch(() => null);
      // try several possible response shapes
      const evalText =
        typeof (evalResp?.response?.text) === "function"
          ? evalResp.response.text()
          : evalResp?.response ?? evalResp?.outputText ?? evalResp?.text ?? JSON.stringify(evalResp);
      const parsed = tryParseJsonFromText(String(evalText || ""));
      if (parsed && Array.isArray(parsed.evaluations)) evaluations = parsed.evaluations;
    } catch (e) {
      console.error("AI evaluation failed:", e);
    }

    let relevantProjects: any[] = [];
    if (evaluations.length > 0) {
      relevantProjects = evaluations
        .filter((e: any) => e && typeof e.projectIndex === "number" && e.score >= 7)
        .map((e: any) => existingProjects[e.projectIndex])
        .filter(Boolean);
    }

    if (relevantProjects.length >= 3) {
      return NextResponse.json({ success: true, data: relevantProjects });
    }

    // Ask AI to generate new templates
    let generatedProjects: any[] = [];
    try {
      const generationModel: any = genAI.getGenerativeModel?.({ model: "gemini-2.0-flash", safetySettings }) || (genAI as any);
      const genPrompt = `
Generate up to 6 hands-on project templates for the exact topic: "${mainTopic}".
Output must be valid JSON array of objects: each object { "title","mainTopic","category","description","difficulty","timeEstimate","learningObjectives":[], "deliverables":[], "technologies": [] }.
Use technologies only relevant to the topic.
`;
      const genResp: any = await generationModel.generateContent?.(genPrompt) ?? await generationModel.generate?.(genPrompt).catch(() => null);
      const genText =
        typeof (genResp?.response?.text) === "function"
          ? genResp.response.text()
          : genResp?.response ?? genResp?.outputText ?? genResp?.text ?? JSON.stringify(genResp);
      const parsed = tryParseJsonFromText(String(genText || ""));
      if (Array.isArray(parsed)) generatedProjects = parsed;
    } catch (e) {
      console.error("AI generation failed:", e);
    }

    if (generatedProjects.length > 0) {
      try {
        const toInsert = generatedProjects.map((p: any) => ({
          mainTopic: p.mainTopic || mainTopic,
          title: p.title || `${mainTopic} Project`,
          category: p.category || "General",
          description: p.description || "",
          difficulty: p.difficulty || "Intermediate",
          timeEstimate: p.timeEstimate || "3-7 days",
          learningObjectives: Array.isArray(p.learningObjectives) ? p.learningObjectives : [],
          deliverables: Array.isArray(p.deliverables) ? p.deliverables : [],
          technologies: Array.isArray(p.technologies) ? p.technologies : [],
        }));
        // cast insertMany to any to prevent TS issues from model types
        await (ProjectTemplate as any).insertMany?.(toInsert, { ordered: false }).catch(() => {});
      } catch (e) {
        console.error("Saving generated templates failed:", e);
      }
      return NextResponse.json({ success: true, data: generatedProjects.slice(0, 6) });
    }

    // final fallback using substring checks
    const fallbackMatches = existingProjects.filter((t: any) =>
      [t.mainTopic, t.title, t.description, t.category, (t.technologies || []).join(" ")].some((f: any) =>
        f && f.toString().toLowerCase().includes(mainTopic.toLowerCase())
      )
    );

    return NextResponse.json({
      success: true,
      data: fallbackMatches.length ? fallbackMatches.slice(0, 6) : existingProjects.slice(0, 6),
      note: "AI returned no strong results; falling back to DB templates.",
    });
  } catch (error: any) {
    console.error("Error in project-templates route:", error);
    return NextResponse.json({ success: false, message: "Internal server error", error: String(error?.message || error) }, { status: 500 });
  }
}