// src/app/api/projects/[projectId]/reject/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../../lib/db";
import Project from "../../../../../lib/models/Project";

// POST to reject a project
export async function POST(req: NextRequest, { params }: { params: { projectId: string } }) {
  await connectDB();
  try {
    const { projectId } = params;

    const project = await Project.findByIdAndUpdate(projectId, { approve: 'rejected' }, { new: true });

    if (!project) {
        return NextResponse.json({ success: false, message: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({
        success: true,
        message: "Project rejected successfully",
        data: project
    });
  } catch (error) {
    console.error("Error rejecting project:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}