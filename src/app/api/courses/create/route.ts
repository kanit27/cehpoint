// src/app/api/courses/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../lib/db";
import Course from "../../../../lib/models/Course";
import { createApi } from "unsplash-js";

const unsplash = createApi({ accessKey: process.env.UNSPLASH_ACCESS_KEY || "" });

export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const { user, content, type, mainTopic } = await req.json();

    if (!user || !content || !type || !mainTopic) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    let photo = "https://via.placeholder.com/600x400.png?text=Course+Image";
    try {
      const result = await unsplash.search.getPhotos({
        query: mainTopic,
        perPage: 1,
        orientation: "landscape",
      });
      if (result.response?.results[0]) {
        photo = result.response.results[0].urls.regular;
      }
    } catch (e) {
      console.error("Unsplash error:", e);
    }

    const newCourse = new Course({ user, content, type, mainTopic, photo });
    await newCourse.save();

    return NextResponse.json({ success: true, message: "Course created successfully", courseId: newCourse._id });
  } catch (error: any) {
    console.error('Error creating course:', error);
    return NextResponse.json({ success: false, message: "Internal server error", error: error.message }, { status: 500 });
  }
}