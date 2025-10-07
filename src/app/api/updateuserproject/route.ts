// app/api/updateuserproject/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/db';
import Project from '../../../lib/models/Project';

export async function POST(req: NextRequest) {
  await connectDB();

  try {
    const { projectId, completed, github_url, video_url } = await req.json();

    if (!projectId) {
      return NextResponse.json({ success: false, message: "Project ID is required" }, { status: 400 });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return NextResponse.json({ success: false, message: "Project not found" }, { status: 404 });
    }
    
    // Logic from your updateUserProject controller
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