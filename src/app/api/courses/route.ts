// app/api/courses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/db';
import Course from '../../../lib/models/Course';

export async function GET(req: NextRequest) {
  await connectDB();

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, message: "User ID is required" }, { status: 400 });
    }

    // Logic from your old getCourses controller
    const courses = await Course.find({ user: userId });
    
    return NextResponse.json(courses, { status: 200 });

  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}