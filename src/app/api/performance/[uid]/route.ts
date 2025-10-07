// app/api/performance/[uid]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/db';
import TrackUser from '../../../../lib/models/TrackUser';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  await connectDB();
  try {
    const { uid } = await params;
    const userTrack = await TrackUser.findOne({ uid });
    if (!userTrack) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: userTrack });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
