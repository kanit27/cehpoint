import { NextRequest, NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";

const fetchWithRetries = async (
  prompt: string,
  retries = 3,
  delay = 1000
) => {
  while (retries > 0) {
    try {
      return await YoutubeTranscript.fetchTranscript(prompt);
    } catch (error) {
      console.warn(`Retrying... (${4 - retries})`);
      if (retries === 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay));
      retries--;
    }
  }
};

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  if (!prompt || typeof prompt !== "string") {
    return NextResponse.json(
      { success: false, message: "Invalid request." },
      { status: 400 }
    );
  }

  try {
    const transcript = await fetchWithRetries(prompt);
    if (!transcript || transcript.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Transcript is not available.",
        },
        { status: 404 }
      );
    }
    return NextResponse.json({ url: transcript });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error fetching transcript." },
      { status: 500 }
    );
  }
}