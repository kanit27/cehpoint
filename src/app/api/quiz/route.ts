// src/app/api/quiz/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/db";
import Quiz from "../../../lib/models/Quiz";

// GET all quiz results (for admin)
export async function GET(req: NextRequest) {
  await connectDB();
  try {
    const results = await Quiz.find({});
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching quiz results:', error);
    return NextResponse.json({ error: 'Failed to fetch quiz results' }, { status: 500 });
  }
}

// POST a new quiz result
export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const { userId, courseId, score } = await req.json();

    if (!userId || !courseId || score === undefined) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const newQuizResult = new Quiz({ userId, courseId, score });
    await newQuizResult.save();
    return NextResponse.json(newQuizResult, { status: 201 });
  } catch (error) {
    console.error('Error saving quiz result:', error);
    return NextResponse.json({ error: 'Failed to save quiz result' }, { status: 500 });
  }
}