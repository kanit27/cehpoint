import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
      remotePatterns: [
        { protocol: 'https', hostname: 'via.placeholder.com' },
        { protocol: 'https', hostname: 'images.unsplash.com' },
        { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
        { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
        { protocol: 'https', hostname: 'ui-avatars.com' },
        { protocol: 'https', hostname: 'encrypted-tbn0.gstatic.com' },
      ],
    },
};

export default nextConfig;
