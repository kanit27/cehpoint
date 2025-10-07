// app/api/auth/google/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/db';
import User from '../../../../lib/models/User';
// IMPORTANT: You'll need to set up Firebase Admin SDK to verify the token
// import { admin } from '@/lib/firebase-admin'; 

export async function POST(req: NextRequest) {
  await connectDB();

  try {
    const { name, email, uid, googleProfileImage, apiKey } = await req.json();

    // In a real app, you MUST verify the token from the client
    // const decodedToken = await admin.auth().verifyIdToken(token);
    // if (decodedToken.email !== email) {
    //   throw new Error("Token does not match user email");
    // }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json({
        success: true,
        message: "SignIn successful",
        userData: existingUser.toObject(),
      }, { status: 200 });
    }

    const newUser = new User({
      email,
      mName: name,
      uid,
      profile: googleProfileImage,
      apiKey,
    });

    await newUser.save();

    return NextResponse.json({
      success: true,
      message: "Account created successfully",
      userData: newUser.toObject(),
    }, { status: 201 });

  } catch (error) {
    console.error("Google Auth error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}