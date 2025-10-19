import { NextRequest, NextResponse } from "next/server";
import youtubesearchapi from "youtube-search-api";
import { compareTwoStrings } from "string-similarity";

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  try {
    const results = await youtubesearchapi.GetListByKeyword(prompt, false, 5, [
      { type: "video" },
    ]);
    const videoData = results.items.map((video: any) => ({
      id: video.id,
      title: video.title,
    }));
    const similarities = videoData.map((video: any) => ({
      id: video.id,
      title: video.title,
      similarity: compareTwoStrings(prompt, video.title),
    }));
    const mostRelevantVideo = similarities.reduce((prev: any, current: any) =>
      current.similarity > prev.similarity ? current : prev
    );
    const videoId = mostRelevantVideo.id;
    return NextResponse.json({ url: videoId });
  } catch (error: any) {
    console.error("Error in getYouTubeVideo:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}