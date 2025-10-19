// src/app/api/projects/[projectId]/approve/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../../lib/db";
import Project from "../../../../../lib/models/Project";

// POST to approve a project
export async function POST(req: NextRequest, { params }: { params: { projectId: string } }) {
  await connectDB();
  try {
    const { projectId } = params;

    const project = await Project.findByIdAndUpdate(projectId, { approve: 'accepted' }, { new: true });

    if (!project) {
        return NextResponse.json({ success: false, message: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({
        success: true,
        message: "Project approved successfully",
        data: project
    });
  } catch (error) {
    console.error("Error approving project:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}