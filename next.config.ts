import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
      domains: [
        "via.placeholder.com",
        "images.unsplash.com",
        "firebasestorage.googleapis.com",
        "lh3.googleusercontent.com"
      ],
    },
};

export default nextConfig;
