// app/api/auth/signin/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/db';
import User from '../../../../lib/models/User';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  await connectDB();

  try {
    const { email, password, firebaseUid } = await req.json();
    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return NextResponse.json({ success: false, message: "Invalid email or password" }, { status: 401 });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { userId: user._id, uid: user.uid },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '30d' }
    );

    // Set JWT cookie
    const cookieStore = await cookies();
    cookieStore.set('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });

    return NextResponse.json({
      success: true,
      message: "SignIn successful",
      userData: user.toObject(),
    });

  } catch (error) {
    console.error("Signin error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}