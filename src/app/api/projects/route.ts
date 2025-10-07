// app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/db';
import Project from '../../../lib/models/Project'; // Assuming you have moved Project model to lib/models/

export async function GET(req: NextRequest) {
  await connectDB();

  try {
    const { searchParams } = new URL(req.url);
    const firebaseUId = searchParams.get('uid');

    if (!firebaseUId) {
      return NextResponse.json({ success: false, message: "Firebase User ID is required" }, { status: 400 });
    }

    // Logic from your old getUserProjects controller
    const projects = await Project.find({ firebaseUId });

    return NextResponse.json(projects, { status: 200 });

  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await connectDB();

  try {
    const body = await req.json();
    const { projectTitle, description, difficulty, time, userId, email, firebaseUId } = body;
    
    // Logic from your old saveProject controller
    const newProject = new Project({
        title: projectTitle,
        description,
        difficulty,
        time,
        userId,
        email,
        firebaseUId
    });
    
    await newProject.save();

    return NextResponse.json({ success: true, message: "Project saved successfully!" }, { status: 201 });
  } catch (error) {
      console.error("Error saving project:", error);
      return NextResponse.json({ success: false, message: "Error saving project" }, { status: 500 });
  }
}