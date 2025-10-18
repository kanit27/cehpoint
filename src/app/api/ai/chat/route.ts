import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import showdown from 'showdown';

// Initialize the AI and Markdown converter
const genAI = new GoogleGenerativeAI(process.env.API_KEY || "");
const converter = new showdown.Converter();

export async function POST(req: NextRequest) {
    try {
        const { prompt } = await req.json();

        // Get the AI model
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Generate a response based on the user's prompt
        const result = await model.generateContent(prompt);
        const aiResponseText = result.response.text();

        // Convert the AI's Markdown response to HTML
        const htmlResponse = converter.makeHtml(aiResponseText);

        return NextResponse.json({ text: htmlResponse });
    } catch (error) {
        console.error("Error in handleChat:", error);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}