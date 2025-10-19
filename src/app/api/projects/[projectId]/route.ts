// src/app/api/projects/[projectId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../lib/db";
import Project from "../../../../lib/models/Project";

// PUT to update a project
export async function PUT(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  await connectDB();
  try {
    const { projectId } = await params;
    const updateData = await req.json();

    const updatedProject = await Project.findByIdAndUpdate(projectId, updateData, { new: true });

    if (!updatedProject) {
      return NextResponse.json({ success: false, message: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Project updated successfully", data: updatedProject });
  } catch (error: any) {
    console.error("Error updating project:", error);
    return NextResponse.json({ success: false, message: "Internal server error", error: error?.message ?? String(error) }, { status: 500 });
  }
}