// src/app/api/courses/finish/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../lib/db";
import Course from "../../../../lib/models/Course";

export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const { courseId } = await req.json();
    if (!courseId) {
      return NextResponse.json({ success: false, message: "Course ID is required" }, { status: 400 });
    }

    const finishedCourse = await Course.findByIdAndUpdate(courseId, {
      $set: {
        completed: true,
        end: Date.now(),
        progress: 100
      }
    }, { new: true });

    if (!finishedCourse) {
        return NextResponse.json({ success: false, message: "Course not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Course marked as finished" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Server error", error: error.message }, { status: 500 });
  }
}