// app/api/auth/signin/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/db';
import User from '../../../../lib/models/User';

export async function POST(req: NextRequest) {
  await connectDB();

  try {
    const { email, password, firebaseUid } = await req.json();

    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return NextResponse.json({ success: false, message: "Invalid email or password" }, { status: 401 });
    }

    // Update the uid if it's different from the firebase one
    if (!user.uid || user.uid !== firebaseUid) {
      user.uid = firebaseUid;
      await user.save();
    }

    return NextResponse.json({
      success: true,
      message: "SignIn successful",
      userData: user.toObject(),
    }, { status: 200 });

  } catch (error) {
    console.error("Signin error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}