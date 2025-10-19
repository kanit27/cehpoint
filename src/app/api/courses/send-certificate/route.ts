// src/app/api/courses/send-certificate/route.ts
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { email, html } = await req.json();
    if (!email || !html) {
      return NextResponse.json({ success: false, message: "Email and HTML content are required" }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        service: "gmail",
        secure: true,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "Certificate of Completion",
        html: html,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: "Certificate sent successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Failed to send email", error: error.message }, { status: 500 });
  }
}