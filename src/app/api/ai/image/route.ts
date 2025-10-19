import { NextRequest, NextResponse } from "next/server";
import gis from "g-i-s";
import { createApi } from "unsplash-js";

const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY || "",
});

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  try {
    const results: any = await new Promise((resolve, reject) => {
      gis(prompt, (error: any, results: any) => {
        if (error || !results || results.length === 0) {
          reject("No results from GIS");
        } else {
          resolve(results);
        }
      });
    });
    return NextResponse.json({ url: results[0].url });
  } catch (gisError) {
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
}