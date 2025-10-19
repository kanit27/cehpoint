// src/app/api/courses/all/route.ts
import { NextResponse } from "next/server";
import connectDB from "../../../../lib/db";
import Course from "../../../../lib/models/Course";

export async function GET() {
  await connectDB();
  try {
    const courses = await Course.find({});
    return NextResponse.json(courses);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}