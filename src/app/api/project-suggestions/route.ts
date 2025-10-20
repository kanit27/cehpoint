import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/db";
import ProjectTemplate from "../../../lib/models/ProjectTemplate";

export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const body = await req.json().catch(() => ({}));
    const mainTopic = (body?.mainTopic || "").toString().trim();

    let templates: any[] = [];
    if (mainTopic) {
      templates = await ProjectTemplate.find({
        $or: [
          { mainTopic: { $regex: mainTopic, $options: "i" } },
          { title: { $regex: mainTopic, $options: "i" } },
          { description: { $regex: mainTopic, $options: "i" } },
        ],
      })
        .limit(200)
        .lean();
    } else {
      templates = await ProjectTemplate.find({}).limit(50).lean();
    }

    return NextResponse.json({ success: true, data: templates });
  } catch (error: any) {
    console.error("project-suggestions POST error:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}