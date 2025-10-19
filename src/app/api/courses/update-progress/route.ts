// src/app/api/courses/update-progress/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../lib/db";
import Course from "../../../../lib/models/Course";

export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const { courseId, progress } = await req.json();
    if (!courseId || progress === undefined) {
      return NextResponse.json({ success: false, message: "Course ID and progress are required" }, { status: 400 });
    }

    const updatedCourse = await Course.findByIdAndUpdate(courseId, {
      $set: {
        progress: progress,
        completed: progress >= 100
      }
    }, { new: true });

    if (!updatedCourse) {
        return NextResponse.json({ success: false, message: "Course not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Progress updated successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Server error", error: error.message }, { status: 500 });
  }
}