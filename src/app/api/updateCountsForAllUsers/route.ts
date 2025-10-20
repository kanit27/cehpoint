import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import TrackUser from "@/lib/models/TrackUser";

function toYMD(d: Date | string) {
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toISOString().split("T")[0];
}

export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const users = await TrackUser.find({});
    let updatedCount = 0;

    for (const user of users) {
      const rawPerf = (user as any).dailyPerformance || [];

      // Normalize and deduplicate by date (keep entry with highest totalScore)
      const byDate: Record<string, any> = {};
      for (const p of rawPerf) {
        const obj = p?.toObject ? p.toObject() : p;
        const dateKey = toYMD(obj.date || obj.createdAt || new Date());
        const totalScore = Number(obj.totalScore || 0);
        const countVal = typeof obj.count === "number" ? obj.count : 0;

        const existing = byDate[dateKey];
        if (!existing || totalScore > existing.totalScore) {
          byDate[dateKey] = { date: dateKey, totalScore, count: countVal };
        }
      }

      // Turn map into sorted array (ascending)
      let perf = Object.values(byDate).sort(
        (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      // Recalculate count: 1 when totalScore increased vs previous day
      let prevScore = 0;
      for (let i = 0; i < perf.length; i++) {
        const entry = perf[i];
        const currScore = Number(entry.totalScore || 0);
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
          const dayDiff = Math.round(
            (new Date(curDate).getTime() - new Date(prevDate).getTime()) / (1000 * 60 * 60 * 24)
          );
          if (dayDiff === 1 && entry.count === 1) {
            currentStreak += 1;
          } else {
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

      // Apply updates and save
      (user as any).dailyPerformance = updatedDaily;
      (user as any).strick = currentStreak;
      (user as any).max_strick = maxStreak;

      await user.save();
      updatedCount++;
    }

    return NextResponse.json({ success: true, updatedCount });
  } catch (error: any) {
    console.error("updateCountsForAllUsers error:", error);
    return NextResponse.json({ success: false, error: error?.message || "Server error" }, { status: 500 });
  }
}