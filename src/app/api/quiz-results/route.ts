// app/api/quiz-results/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/db';
import Quiz from '../../../lib/models/Quiz';

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
        return NextResponse.json({ error: 'Failed to save quiz result' }, { status: 500 });
    }
}