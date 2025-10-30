import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import TrackUser from "@/lib/models/TrackUser";

/**
 * Returns aggregated user details (projects/courses/quizzes counts & averages)
 * similar to server controller getPerformanceOfAllUser.
 */
export async function GET(req: NextRequest) {
  await connectDB();
  try {
    const usersWithDetails = await User.aggregate([
      {
        $lookup: {
          from: "project-users",
          localField: "uid",
          foreignField: "firebaseUId",
          as: "projects",
        },
      },
      {
        $lookup: {
          from: "courses",
          localField: "uid",
          foreignField: "user",
          as: "courses",
        },
      },
      {
        $lookup: {
          from: "quizzes",
          localField: "uid",
          foreignField: "userId",
          as: "quizzes",
        },
      },
      {
        $addFields: {
          projectCount: { $size: "$projects" },
          courseCount: { $size: "$courses" },
          quizScoreAvg: {
            $cond: {
              if: { $gt: [{ $size: "$quizzes" }, 0] },
              then: { $avg: "$quizzes.score" },
              else: 0,
            },
          },
          averageProgress: {
            $cond: {
              if: { $gt: [{ $size: "$courses" }, 0] },
              then: { $avg: "$courses.progress" },
              else: 0,
            },
          },
        },
      },
      {
        $project: {
          email: 1,
          mName: 1,
          profile: 1,
          role: 1,
          type: 1,
          uid: 1,
          projectCount: 1,
          courseCount: 1,
          quizScoreAvg: 1,
          averageProgress: 1,
        },
      },
    ]);

    return NextResponse.json({ success: true, data: usersWithDetails });
  } catch (error: any) {
    console.error("Error fetching all performance data:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Server error" },
      { status: 500 }
    );
  }
}