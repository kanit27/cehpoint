// src/app/api/quiz/[userId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../lib/db";
import Quiz from "../../../../lib/models/Quiz";

export async function GET(req: NextRequest, { params }: { params: { userId: string } }) {
  await connectDB();
  try {
    const { userId } = params;
    const results = await Quiz.find({ userId: userId });

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching user quiz results:', error);
    return NextResponse.json({ error: 'Failed to fetch user quiz results' }, { status: 500 });
  }
}