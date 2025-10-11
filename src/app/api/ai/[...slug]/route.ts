// src/app/api/ai/[...slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import youtubesearchapi from "youtube-search-api";
import { compareTwoStrings } from 'string-similarity';
import showdown from 'showdown';

const genAI = new GoogleGenerativeAI(process.env.API_KEY || "");
const converter = new showdown.Converter();

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  // ... other safety settings
];

export async function POST(req: NextRequest, { params }: { params: { slug: string[] } }) {
    const slug = params.slug.join('/');
    const body = await req.json();

    try {
        let model;
        const { useUserApiKey, userApiKey, prompt } = body;

        if (useUserApiKey && userApiKey) {
            const genAIuser = new GoogleGenerativeAI(userApiKey);
            model = genAIuser.getGenerativeModel({ model: "gemini-2.0-flash", safetySettings });
        } else {
            model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", safetySettings });
        }

        if (slug === 'prompt') {
            const result = await model.generateContent(prompt);
            return NextResponse.json({ generatedText: result.response.text() });
        }

        if (slug === 'generate') {
            const result = await model.generateContent(prompt);
            const htmlContent = converter.makeHtml(result.response.text());
            return NextResponse.json({ text: htmlContent });
        }
        
        if (slug === 'yt') {
            const results = await youtubesearchapi.GetListByKeyword(prompt, false, 5, [{ type: "video" }]);
            if (results.items.length === 0) return NextResponse.json({ url: '' });

            const videoData = results.items.map((video: any) => ({ id: video.id, title: video.title }));
            const similarities = videoData.map((video: any) => ({ ...video, similarity: compareTwoStrings(prompt, video.title) }));
            const mostRelevantVideo = similarities.reduce((prev: any, current: any) => (current.similarity > prev.similarity ? current : prev));
            
            return NextResponse.json({ url: mostRelevantVideo.id });
        }

        return NextResponse.json({ message: "Not Found" }, { status: 404 });

    } catch (error: any) {
        console.error(`Error in /api/ai/${slug}:`, error);
        return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
    }
}