import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/db";
import TrackUser from "../../../lib/models/TrackUser";

function toYMD(d: Date | string) {
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toISOString().split("T")[0];
}

export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const allUsers = await TrackUser.find({});
    let updatedCount = 0;

    for (const user of allUsers) {
      // Normalize and sort dailyPerformance by date (ascending)
      const perf = (user.dailyPerformance || []).map((p: any) => ({
        ...p._doc,
        date: toYMD(p.date || p),
        totalScore: p.totalScore || 0,
        count: typeof p.count === "number" ? p.count : 0,
      }));
      perf.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Recalculate count (1 when totalScore increased vs previous day, else 0)
      let prevScore = 0;
      for (let i = 0; i < perf.length; i++) {
        const entry = perf[i];
        const currScore = entry.totalScore || 0;
        entry.count = currScore - prevScore > 0 ? 1 : 0;
        prevScore = currScore;
      }

      // Recalculate streaks (consecutive days with count === 1)
      let maxStreak = user.max_strick || 0;
      let currentStreak = 0;
      let prevDate: string | null = null;

      for (const entry of perf) {
        const curDate = entry.date;
        if (prevDate) {
          const dayDiff =
            (new Date(curDate).getTime() - new Date(prevDate).getTime()) /
            (1000 * 60 * 60 * 24);
          if (dayDiff === 1 && entry.count === 1) {
            currentStreak += 1;
          } else if (dayDiff > 1 || entry.count === 0) {
            maxStreak = Math.max(maxStreak, currentStreak);
            currentStreak = entry.count === 1 ? 1 : 0;
          }
        } else {
          currentStreak = entry.count === 1 ? 1 : 0;
        }
        prevDate = curDate;
      }
      maxStreak = Math.max(maxStreak, currentStreak);

      // Map perf back to mongoose-friendly objects (dates as Date)
      const updatedDaily = perf.map((p: any) => ({
        date: new Date(p.date + "T00:00:00.000Z"),
        totalScore: p.totalScore,
        count: p.count,
      }));

      // Apply updates to document
      user.dailyPerformance = updatedDaily;
      user.strick = currentStreak;
      user.max_strick = maxStreak;

      await user.save();
      updatedCount++;
    }

    return NextResponse.json({ success: true, updatedCount });
  } catch (error) {
    console.error("Error in updateCountsForAllUsers:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}