import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import TrackUser from "@/lib/models/TrackUser";
import User from "@/lib/models/User";

/**
 * Recomputes performance for all users from User collections (projects/courses/quizzes),
 * updates/creates TrackUser.dailyPerformance and performanceScore, then recomputes streaks.
 */
export async function POST(req: NextRequest) {
  await connectDB();

  try {
    // Aggregate user-related counts & averages. Collection names follow server controller.
    const usersWithDetails = await User.aggregate([
      {
        $lookup: {
          from: "project-users", // same as in topCandidateController.js
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

    const today = new Date();
    const todayString = today.toISOString().split("T")[0];
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split("T")[0];

    // Update or create TrackUser records from aggregated data
    for (const user of usersWithDetails) {
      const totalScore =
        (user.projectCount || 0) +
        (user.courseCount || 0) +
        (user.quizScoreAvg || 0) +
        (user.averageProgress || 0);

      let userTrack = await TrackUser.findOne({ uid: user.uid });

      if (userTrack) {
        // today's performance entry
        const todayPerformance = userTrack.dailyPerformance.find(
          (e: any) => new Date(e.date).toISOString().split("T")[0] === todayString
        );

        const yesterdayPerformance = userTrack.dailyPerformance.find(
          (e: any) => new Date(e.date).toISOString().split("T")[0] === yesterdayString
        );

        const yesterdayScore = yesterdayPerformance ? (yesterdayPerformance.totalScore || 0) : 0;
        const count = (totalScore - yesterdayScore) !== 0 ? 1 : 0;

        if (todayPerformance) {
          todayPerformance.totalScore = totalScore;
          todayPerformance.count = count;
        } else {
          userTrack.dailyPerformance.push({
            date: today,
            totalScore,
            count,
          });
        }

        userTrack.performanceScore = {
          projectCount: user.projectCount || 0,
          courseCount: user.courseCount || 0,
          quizScoreAvg: user.quizScoreAvg || 0,
          averageProgress: user.averageProgress || 0,
          totalScore,
        };
      } else {
        // create
        userTrack = new TrackUser({
          email: user.email,
          mName: user.mName,
          type: user.type,
          uid: user.uid,
          dailyPerformance: [
            {
              date: today,
              totalScore,
              count: 0,
            },
          ],
          performanceScore: {
            projectCount: user.projectCount || 0,
            courseCount: user.courseCount || 0,
            quizScoreAvg: user.quizScoreAvg || 0,
            averageProgress: user.averageProgress || 0,
            totalScore,
          },
          strick: 0,
          max_strick: 0,
        });
      }

      await userTrack.save();
    }

    // Recompute streaks for all TrackUser documents (same logic as controller)
    const allTracks = await TrackUser.find();
    for (const t of allTracks) {
      let maxStreak = t.max_strick || 0;
      let currentStreak = 0;

      const sortedPerformance = (t.dailyPerformance || []).slice().sort(
        (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      let previousDate: Date | null = null;

      for (const entry of sortedPerformance) {
        const currentDate = new Date(entry.date);
        if (previousDate) {
          const dayDifference = Math.round(
            (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          if (dayDifference === 1 && entry.count === 1) {
            currentStreak += 1;
          } else if (dayDifference > 1 || entry.count === 0) {
            maxStreak = Math.max(maxStreak, currentStreak);
            currentStreak = entry.count === 1 ? 1 : 0;
          }
        } else {
          currentStreak = entry.count === 1 ? 1 : 0;
        }
        previousDate = currentDate;
      }

      maxStreak = Math.max(maxStreak, currentStreak);
      t.strick = currentStreak;
      t.max_strick = maxStreak;
      await t.save();
    }

    return NextResponse.json({ success: true, message: "Performance updated and streaks recomputed" });
  } catch (error: any) {
    console.error("Error updating performance data:", error);
    return NextResponse.json({ success: false, message: error?.message || "Server error" }, { status: 500 });
  }
}