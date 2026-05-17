import { NextRequest, NextResponse } from "next/server";
import { createApi } from "unsplash-js";

const unsplash = createApi({
  accessKey: process.env.UNSPLASH_API_KEY || "",
});

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  try {
    const unsplashResponse = await unsplash.search.getPhotos({
      query: prompt,
      page: 1,
      perPage: 1,
      orientation: "landscape",
    });

    if (
      unsplashResponse.response &&
      unsplashResponse.response.results.length > 0
    ) {
      return NextResponse.json({
        url: unsplashResponse.response.results[0].urls.regular,
      });
    } else {
      const defaultImageUrl = "https://via.placeholder.com/150";
      return NextResponse.json({ url: defaultImageUrl });
    }
  } catch (unsplashError) {
    console.error("Error with Unsplash:", unsplashError);
    const defaultImageUrl = "https://via.placeholder.com/150";
    return NextResponse.json({ url: defaultImageUrl });
  }
}