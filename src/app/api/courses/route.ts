// src/app/api/courses/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/db";
import Course from "../../../lib/models/Course";

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ success: false, message: "User ID is required" }, { status: 400 });
  }

  try {
    const courses = await Course.find({ user: userId });
    return NextResponse.json(courses);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}