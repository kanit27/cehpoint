// app/api/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/db';
import User from '../../../lib/models/User';
import Course from '../../../lib/models/Course';

export async function POST(req: NextRequest) {
    await connectDB();
    try {
        const userCount = await User.countDocuments();
        const admins = await User.find({ role: "admin" }, "email");
        const freeCount = await User.countDocuments({ type: "free" });
        const paidCount = await User.countDocuments({ type: "paid" });
        const courseCount = await Course.countDocuments();
        const videoAndTextCourseCount = await Course.countDocuments({ type: "video & text course" });
        const textAndImageCourseCount = await Course.countDocuments({ type: "text & image course" });
        const completedCourseCount = await Course.countDocuments({ completed: true });

        const dashboardData = {
            users: userCount,
            admins: admins,
            frees: freeCount,
            paids: paidCount,
            courses: courseCount,
            videoAndTextCourses: videoAndTextCourseCount,
            textAndImageCourses: textAndImageCourseCount,
            completedCourses: completedCourseCount
        };

        return NextResponse.json(dashboardData);
    } catch (error) {
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}
