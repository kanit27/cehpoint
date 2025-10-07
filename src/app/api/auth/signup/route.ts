// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/db';
import User from '../../../../lib/models/User';
// Note: You would also import your OTP sending logic here

export async function POST(req: NextRequest) {
  await connectDB(); // Connect to the database

  try {
    const { email, mName, password, type, uid, profile, apiKey, unsplashApiKey } = await req.json();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: "User with this email already exists",
      }, { status: 409 }); // 409 Conflict
    }

    const newUser = new User({
      email, mName, password, type, uid, profile, apiKey, unsplashApiKey,
      verified: false
    });
    
    await newUser.save();
    
    // You would trigger your OTP email logic here (from userController.js)
    // sendOTPVerificationEmail({ uid: newUser.uid, email: newUser.email });

    return NextResponse.json({
      success: true,
      status: "Pending",
      message: "Account created successfully & verification OTP sent to email",
      data: { uid: newUser.uid, email: newUser.email }
    }, { status: 201 }); // 201 Created

  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}