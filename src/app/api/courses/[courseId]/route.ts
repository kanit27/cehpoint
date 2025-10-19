// src/app/api/courses/[courseId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Course from '@/lib/models/Course';

export async function GET(req: NextRequest, { params }: { params: { courseId: string } }) {
  await connectDB();
  try {
    const course = await Course.findById(params.courseId);
    if (!course) {
      return NextResponse.json({ success: false, message: "Course not found" }, { status: 404 });
    }
    return NextResponse.json(course);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Server error", error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { courseId: string } }) {
  await connectDB();
  try {
    const deletedCourse = await Course.findByIdAndDelete(params.courseId);
    if (!deletedCourse) {
      return NextResponse.json({ success: false, message: "Course not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Course deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Server error", error: error.message }, { status: 500 });
  }
}