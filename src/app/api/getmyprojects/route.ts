// app/api/getmyprojects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/db';
import Project from '../../../lib/models/Project';

export async function GET(req: NextRequest) {
  await connectDB();

  try {
    // This logic fetches all projects as per your original controller
    const projects = await Project.find();
    
    return NextResponse.json({ success: true, data: projects }, { status: 200 });

  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}