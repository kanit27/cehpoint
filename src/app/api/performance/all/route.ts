import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/db';
import TrackUser from '../../../../lib/models/TrackUser';

export async function GET(req: NextRequest) {
  await connectDB();
  try {
    const users = await TrackUser.find({});
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}