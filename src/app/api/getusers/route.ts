import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/db";
import User from "../../../lib/models/User";

export async function GET(req: NextRequest) {
  await connectDB();

  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const uid = searchParams.get("uid");

    if (email) {
      const user = await User.findOne({ email }).select("email mName uid _id role profile").lean();
      if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
      return NextResponse.json({ success: true, data: user });
    }

    if (uid) {
      const user = await User.findOne({ uid }).select("email mName uid _id role profile").lean();
      if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
      return NextResponse.json({ success: true, data: user });
    }

    const users = await User.find({}).select("email mName uid _id role profile").lean();
    return NextResponse.json({ success: true, data: users });
  } catch (error: any) {
    console.error("GET /api/getusers error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: String(error?.message || error) },
      { status: 500 }
    );
  }
}