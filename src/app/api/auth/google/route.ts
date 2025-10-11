// app/api/auth/google/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/db';
import User from '../../../../lib/models/User';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  await connectDB();

  try {
    const { name, email, uid, googleProfileImage } = await req.json();
    let user = await User.findOne({ email });
    let message = "SignIn successful";
    let status = 200;

    // If the user doesn't exist, create a new one
    if (!user) {
      user = new User({
        email,
        mName: name,
        uid,
        profile: googleProfileImage,
        verified: true, // Google sign-in implies a verified email
      });
      await user.save();
      message = "Account created successfully";
      status = 201;
    }

    // Generate JWT Token
    const token = jwt.sign(
      { userId: user._id, uid: user.uid },
      process.env.JWT_SECRET || 'your_default_secret',
      { expiresIn: '30d' }
    );

    // Set JWT cookie
    const cookieStore = await cookies();
    cookieStore.set('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
      path: '/',
    });

    return NextResponse.json({
      success: true,
      message: message,
      userData: user.toObject(),
    }, { status: status });

  } catch (error) {
    console.error("Google Auth error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}