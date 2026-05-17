import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/db";
import ProjectTemplate from "../../../lib/models/ProjectTemplate";
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

function extractJson(text: string): any {
  const cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*$/gm, "")
    .replace(/```/g, "")
    .trim();
  const arrayMatch = cleaned.match(/\[[\s\S]*?\]/);
  if (arrayMatch) {
    try {
      return JSON.parse(arrayMatch[0]);
    } catch { }
  }
  const objectMatch = cleaned.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    try {
      return JSON.parse(objectMatch[0]);
    } catch { }
  }
  return null;
}

const FALLBACK_PROJECTS: Record<string, any[]> = {
  "stock market": [
    { title: "Stock Portfolio Tracker", category: "Finance", description: "Build a personal portfolio tracker that fetches real-time stock prices and visualizes profit/loss across your investments.", difficulty: "Intermediate", timeEstimate: "5-7 days", learningObjectives: ["API integration", "Data visualization", "Portfolio math"], deliverables: ["Working dashboard with charts", "Portfolio CRUD operations"], technologies: ["React", "Node.js", "Alpha Vantage API", "Chart.js"] },
    { title: "Stock Price Predictor Using ML", category: "Finance", description: "Train a machine learning model to predict short-term stock price movements using historical data.", difficulty: "Advanced", timeEstimate: "7-10 days", learningObjectives: ["Time series forecasting", "Feature engineering", "Model evaluation"], deliverables: ["Trained model with accuracy metrics", "Prediction dashboard"], technologies: ["Python", "scikit-learn", "Pandas", "Streamlit"] },
    { title: "Real-Time Stock Market Dashboard", category: "Finance", description: "Create a live dashboard that tracks multiple stocks, news sentiment, and market indices in real time.", difficulty: "Intermediate", timeEstimate: "5-8 days", learningObjectives: ["WebSocket integration", "Real-time data processing", "Dashboard design"], deliverables: ["Live updating dashboard", "News sentiment widget"], technologies: ["React", "Socket.io", "Finnhub API", "D3.js"] },
    { title: "Automated Trading Bot Simulator", category: "Finance", description: "Design a paper-trading bot that executes mock trades based on moving average crossovers and RSI indicators.", difficulty: "Advanced", timeEstimate: "7-10 days", learningObjectives: ["Algorithmic trading strategies", "Backtesting", "Risk management"], deliverables: ["Backtest engine", "Simulated trading log"], technologies: ["Python", "pandas", "Backtrader", "Yahoo Finance API"] },
    { title: "Stock Market Education Platform", category: "Education", description: "Build an interactive learning platform that teaches stock market basics through quizzes and simulations.", difficulty: "Beginner", timeEstimate: "3-5 days", learningObjectives: ["Content structuring", "Interactive quiz mechanics", "Progress tracking"], deliverables: ["Quiz module", "Progress dashboard"], technologies: ["Next.js", "MongoDB", "Tailwind CSS"] },
    { title: "Earnings Call Analyzer", category: "Finance", description: "Analyze earnings call transcripts to extract sentiment, key metrics, and generate summaries.", difficulty: "Intermediate", timeEstimate: "5-7 days", learningObjectives: ["NLP sentiment analysis", "Text summarization", "Data extraction"], deliverables: ["Transcript analyzer", "Sentiment report"], technologies: ["Python", "NLTK", "Hugging Face", "Flask"] },
  ],
};

function getFallbackProjects(topic: string): any[] {
  const lower = topic.toLowerCase();
  for (const [key, projects] of Object.entries(FALLBACK_PROJECTS)) {
    if (lower.includes(key)) return projects;
  }
  return [];
}

export async function GET() {
  await connectDB();
  try {
    const templates = await ProjectTemplate.find().lean();
    return NextResponse.json({ success: true, data: templates });
  } catch (error: any) {
    console.error("Error fetching project templates:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await connectDB();

  try {
    const body = await req.json().catch(() => ({}));
    const mainTopic = (body?.mainTopic || "").toString().trim();

    const existingProjects = await ProjectTemplate.find().limit(20).lean().catch(() => []);

    if (!mainTopic) {
      return NextResponse.json({ success: true, data: existingProjects });
    }

    let generatedProjects: any[] = [];

    try {
      const model = genAI.getGenerativeModel({
        model: "gemma-4-26b-a4b-it",
        safetySettings,
        generationConfig: {
          maxOutputTokens: 2048,
          temperature: 0.7,
        },
      });

      const prompt = `Generate up to 6 hands-on project templates for the topic: "${mainTopic}".
Return ONLY a valid JSON array. Each object must have: title, category, description, difficulty, timeEstimate, learningObjectives (array of strings), deliverables (array of strings), technologies (array of strings).
No markdown, no code fences, no extra text — just the JSON array.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const parsed = extractJson(text);
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
        await (ProjectTemplate as any).insertMany?.(toInsert, { ordered: false }).catch(() => {});
      } catch (e) {
        console.error("Saving generated templates failed:", e);
      }
      return NextResponse.json({ success: true, data: generatedProjects.slice(0, 6) });
    }

    const fallback = getFallbackProjects(mainTopic);
    if (fallback.length > 0) {
      return NextResponse.json({
        success: true,
        data: fallback,
        note: "Showing curated templates for this topic.",
      });
    }

    if (existingProjects.length > 0) {
      const filtered = existingProjects.filter((t: any) =>
        [t.mainTopic, t.title, t.description, t.category].some((f: any) =>
          f && f.toString().toLowerCase().includes(mainTopic.toLowerCase())
        )
      );
      return NextResponse.json({
        success: true,
        data: filtered.length ? filtered.slice(0, 6) : existingProjects.slice(0, 6),
      });
    }

    return NextResponse.json({
      success: true,
      data: [],
      note: "No projects available for this topic yet.",
    });
  } catch (error: any) {
    console.error("Error in project-templates route:", error);
    return NextResponse.json({ success: false, message: "Internal server error", error: String(error?.message || error) }, { status: 500 });
  }
}