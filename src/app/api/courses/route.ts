// app/api/courses/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/db";
import Course from "../../../lib/models/Course";
import nodemailer from "nodemailer";

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  try {
    if (userId) {
      const courses = await Course.find({ user: userId });
      return NextResponse.json(courses);
    }
    
    // Fallback to get all courses if no userId is provided (for admin purposes, for example)
    const courses = await Course.find({});
    return NextResponse.json(courses);

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  const { action, courseId, content, progress, completed, html, email } = body;

  try {
    switch (action) {
      case "update":
        await Course.findByIdAndUpdate(courseId, { $set: { content } });
        return NextResponse.json({ success: true, message: "Course updated successfully" });

      case "finish":
        await Course.findByIdAndUpdate(courseId, { $set: { completed: true, end: Date.now(), progress: 100 } });
        return NextResponse.json({ success: true, message: "Course completed successfully" });

      case "sendcertificate":
        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com", port: 465, service: "gmail", secure: true,
          auth: { user: process.env.EMAIL, pass: process.env.PASSWORD },
        });
        const mailOptions = { from: process.env.EMAIL, to: email, subject: "Certification of completion", html };
        await transporter.sendMail(mailOptions);
        return NextResponse.json({ success: true, message: "Email sent successfully" });

      case "updateProgress":
        await Course.findByIdAndUpdate(courseId, { $set: { progress, completed: completed || progress === 100 } });
        return NextResponse.json({ success: true, message: "Progress updated successfully" });

      default:
        return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}