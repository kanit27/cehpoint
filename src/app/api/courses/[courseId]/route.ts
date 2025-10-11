// app/api/courses/[courseId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Course from '@/lib/models/Course';

export async function GET(req: NextRequest, context: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await context.params;
  await connectDB();
  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ success: false, message: "Course not found" }, { status: 404 });
    }
    return NextResponse.json(course);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await context.params;
  await connectDB();
  try {
    await Course.findByIdAndDelete(courseId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}