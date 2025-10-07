import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/db';
import Project from '../../../../lib/models/Project';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  await connectDB();

  try {
    const { projectId } = await params;
    const body = await req.json();
    const { completed, github_url, video_url } = body;

    const project = await Project.findById(projectId);

    if (!project) {
      return NextResponse.json({ success: false, message: "Project not found" }, { status: 404 });
    }

    // Update fields if they are provided
    if (typeof completed !== 'undefined') project.completed = completed;
    if (github_url) project.github_url = github_url;
    if (video_url) project.video_url = video_url;
    
    await project.save();

    return NextResponse.json({ success: true, message: "Project updated successfully", data: project }, { status: 200 });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}