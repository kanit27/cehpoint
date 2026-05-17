import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/db";
import ProjectTemplate from "../../../lib/models/ProjectTemplate";

function escapeRegex(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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

export async function POST(req: NextRequest) {
  await connectDB();

  try {
    const body = await req.json().catch(() => ({}));
    const mainTopicRaw = (body?.mainTopic || "").toString().trim();
    const mainTopic = mainTopicRaw;
    console.log("[project-suggestions] mainTopic:", mainTopic);

    const totalTemplates = await ProjectTemplate.countDocuments().catch(() => 0);
    if (totalTemplates === 0) {
      const fallback = getFallbackProjects(mainTopic);
      if (fallback.length > 0) {
        return NextResponse.json({
          success: true,
          data: fallback,
          count: fallback.length,
          note: "Showing curated templates for this topic.",
        });
      }
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
        note: "No projects available for this topic yet.",
      });
    }

    const textFields: string[] = [
      "mainTopic",
      "title",
      "name",
      "templateTitle",
      "description",
      "content",
      "body",
      "topic",
      "topics",
      "category",
    ];
    const arrayFields: string[] = ["technologies", "techs", "tags", "skills"];

    let templates: any[] = [];

    if (mainTopic) {
      const escaped = escapeRegex(mainTopic);
      const regex = new RegExp(escaped, "i");

      const orClauses: any[] = textFields.map((f) => ({ [f]: { $regex: regex } }));
      arrayFields.forEach((f) => orClauses.push({ [f]: { $elemMatch: { $regex: regex } } }));

      templates = await ProjectTemplate.find({ $or: orClauses }).limit(200).lean();

      if (!templates || templates.length === 0) {
        const words: string[] = mainTopic.split(/\s+/).filter(Boolean).slice(0, 6);
        if (words.length > 0) {
          const wordOrs = words.flatMap((w: string) => {
            const r = new RegExp(escapeRegex(w), "i");
            return [
              ...textFields.map((f) => ({ [f]: { $regex: r } })),
              ...arrayFields.map((f) => ({ [f]: { $elemMatch: { $regex: r } } })),
            ];
          });
          templates = await ProjectTemplate.find({ $or: wordOrs }).limit(200).lean();
        }
      }
    } else {
      templates = await ProjectTemplate.find({}).limit(50).lean();
    }

    const count = (templates && templates.length) || 0;
    console.log(`[project-suggestions] found ${count} templates for topic="${mainTopic}"`);

    if (!templates || templates.length === 0) {
      const fallback = getFallbackProjects(mainTopic);
      if (fallback.length > 0) {
        return NextResponse.json({ success: true, data: fallback, count: fallback.length, note: "Showing curated templates for this topic." });
      }
      return NextResponse.json({ success: true, data: [], count: 0, note: "No projects available for this topic yet." });
    }

    return NextResponse.json({ success: true, data: templates, count });
  } catch (error: any) {
    console.error("project-suggestions POST error:", error);
    return NextResponse.json(
      { success: false, error: "Server error", details: String(error?.message || error) },
      { status: 500 }
    );
  }
}