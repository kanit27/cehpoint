import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/db";
import ProjectTemplate from "../../../lib/models/ProjectTemplate";

function escapeRegex(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function POST(req: NextRequest) {
  await connectDB();

  try {
    const body = await req.json().catch(() => ({}));
    const mainTopicRaw = (body?.mainTopic || "").toString().trim();
    const mainTopic = mainTopicRaw;
    console.log("[project-suggestions] mainTopic:", mainTopic);

    // If collection empty, detect and return sample keys to help debug schema mismatch
    const totalTemplates = await ProjectTemplate.countDocuments().catch(() => 0);
    if (totalTemplates === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
        note: "ProjectTemplate collection is empty. Seed templates or check DB connection.",
      });
    }

    // broadened list of candidate fields to search (covers many schema variations)
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

      // build $or conditions for text fields
      const orClauses: any[] = textFields.map((f) => ({ [f]: { $regex: regex } }));
      // for array-like fields, use $elemMatch
      arrayFields.forEach((f) => orClauses.push({ [f]: { $elemMatch: { $regex: regex } } }));

      templates = await ProjectTemplate.find({ $or: orClauses }).limit(200).lean();

      // If nothing found, try word-by-word matching
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

    // If still empty, sample one document and return its field names in note to guide schema fix
    if (!templates || templates.length === 0) {
      const sample = await ProjectTemplate.findOne().lean();
      const sampleKeys = sample ? Object.keys(sample).slice(0, 40) : [];
      const fallback = await ProjectTemplate.find({}).limit(10).lean();
      const note = sample
        ? `No direct matches. ProjectTemplate sample fields: ${sampleKeys.join(", ")} — adapt search fields to your schema or seed templates.`
        : "No matches and no sample doc available.";
      return NextResponse.json({ success: true, data: fallback || [], count: (fallback || []).length, note });
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