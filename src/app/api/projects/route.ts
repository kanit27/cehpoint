// src/app/api/projects/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/db";
import Project from "../../../lib/models/Project";

// GET user projects (e.g., /api/projects?uid=some-firebase-uid)
// GET all projects for admin (e.g., /api/projects)
export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const firebaseUId = searchParams.get("uid");

  try {
    const query = firebaseUId ? { firebaseUId } : {};
    const projects = await Project.find(query);

    return NextResponse.json({
        success: true,
        data: projects,
        message: "Projects fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// POST (save) a new project
export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const body = await req.json();

    // Provide sensible default for `time` to avoid validation error
    if (!body.time) {
      body.time = "1"; // default duration (weeks) — adjust as needed
    }

    // Validate required fields and return 400 if any are missing
    const required = ["title", "description", "firebaseUId"];
    const missing = required.filter((f) => !body[f]);
    if (missing.length) {
      return NextResponse.json(
        { success: false, message: `Missing required fields: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    const newProject = new Project(body);
    await newProject.save();

    return NextResponse.json({ success: true, message: "Project saved successfully!", data: newProject }, { status: 201 });
  } catch (error: any) {
    console.error("Error saving project:", error);
    return NextResponse.json({ success: false, message: "Error saving project", error: error?.message ?? String(error) }, { status: 500 });
  }
}