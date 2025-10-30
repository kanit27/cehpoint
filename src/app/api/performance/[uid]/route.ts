// app/api/performance/[uid]/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import TrackUser from "@/lib/models/TrackUser";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ uid: string }> } // match Next.js expected type
) {
  await connectDB();

  try {
    const { uid } = await context.params; // await the promised params
    if (!uid) {
      return NextResponse.json({ success: false, message: "UID required" }, { status: 400 });
    }

    const userTrack = await TrackUser.findOne({ uid });
    if (!userTrack) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const daily = (userTrack.dailyPerformance || [])
      .slice()
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return NextResponse.json({
      success: true,
      data: { ...userTrack.toObject(), dailyPerformance: daily },
    });
  } catch (error: any) {
    console.error("Error fetching performance by UID:", error);
    return NextResponse.json({ success: false, message: error?.message || "Server error" }, { status: 500 });
  }
}
