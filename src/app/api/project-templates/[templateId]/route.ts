// src/app/api/project-templates/[templateId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../lib/db";
import ProjectTemplate from "../../../../lib/models/ProjectTemplate";

export async function PUT(req: NextRequest, { params }: { params: { templateId: string } }) {
    await connectDB();
    try {
        const { templateId } = params;
        const { userId, title } = await req.json();

        if (!userId || !title) {
            return NextResponse.json({ success: false, message: "User ID and title are required" }, { status: 400 });
        }

        const updatedProject = await ProjectTemplate.findByIdAndUpdate(
            templateId,
            { $addToSet: { assignedTo: { userid: userId, title: title } } },
            { new: true }
        );

        if (!updatedProject) {
            return NextResponse.json({ success: false, message: "Project Template not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: updatedProject });
    } catch (error: any) {
        console.error("Error assigning project template:", error);
        return NextResponse.json({ success: false, message: "Internal server error", error: error.message }, { status: 500 });
    }
}