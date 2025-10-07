// app/api/key/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/db';
import User from '../../../lib/models/User';

export async function POST(req: NextRequest) {
    await connectDB();
    try {
        const { key } = await req.json();
        if (!key) {
            return NextResponse.json({ error: "API key is required" }, { status: 400 });
        }

        const result = await User.updateMany({}, { $set: { apiKey: key } });
        
        return NextResponse.json({
            message: `API key changed successfully for ${result.modifiedCount} users`,
            modifiedCount: result.modifiedCount,
        });

    } catch (error) {
        return NextResponse.json({ error: "An error occurred while updating the API key" }, { status: 500 });
    }
}