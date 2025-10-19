// src/app/api/projects/[projectId]/approve/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../../lib/db";
import Project from "../../../../../lib/models/Project";

// POST to approve a project
export async function POST(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  await connectDB();
  try {
    const { projectId } = await params;
    const body = await req.json();

    const project = await Project.findByIdAndUpdate(projectId, { approve: 'accepted' }, { new: true });

    if (!project) {
        return NextResponse.json({ success: false, message: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({
        success: true,
        message: "Project approved successfully",
        data: project
    });
  } catch (error: any) {
    console.error("Error approving project:", error);
    return NextResponse.json({ success: false, message: "Internal server error", error: error?.message ?? String(error) }, { status: 500 });
  }
}