// src/app/api/courses/update/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../lib/db";
import Course from "../../../../lib/models/Course";

export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const { courseId, content } = await req.json();
    if (!courseId || !content) {
      return NextResponse.json({ success: false, message: "Course ID and content are required" }, { status: 400 });
    }

    const updatedCourse = await Course.findByIdAndUpdate(courseId, { $set: { content: content } }, { new: true });
    if (!updatedCourse) {
        return NextResponse.json({ success: false, message: "Course not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Course updated successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Server error", error: error.message }, { status: 500 });
  }
}