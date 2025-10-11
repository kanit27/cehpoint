// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/db';
import User from '../../../../lib/models/User';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

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
    
    // Generate JWT Token
    const token = jwt.sign(
      { userId: newUser._id, uid: newUser.uid },
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
      status: "Pending",
      message: "Account created successfully",
      data: { uid: newUser.uid, email: newUser.email }
    }, { status: 201 }); // 201 Created

  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}