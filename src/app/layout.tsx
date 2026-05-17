// app/layout.tsx

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "../context/ThemeContext";
import { SkillsProvider } from "../context/SkillsContext";
import ToastProvider from "./components/ToastProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CEH Point - AI-Powered CEH Certification Training",
  description: "Master CEH (Certified Ethical Hacker) certification with AI-generated courses, quizzes, and hands-on projects. Learn cybersecurity skills with personalized learning paths.",
  keywords: ["CEH", "Certified Ethical Hacker", "cybersecurity", "AI learning", "ethical hacking", "certification training"],
  openGraph: {
    title: "CEH Point - AI-Powered CEH Certification Training",
    description: "Master CEH certification with AI-generated courses, quizzes, and hands-on projects.",
    type: "website",
    siteName: "CEH Point",
  },
  twitter: {
    card: "summary_large_image",
    title: "CEH Point - AI-Powered CEH Certification Training",
    description: "Master CEH certification with AI-generated courses, quizzes, and hands-on projects.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

// This new function correctly handles the viewport settings
export const generateViewport = (): Viewport => {
  return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1, // Optional: Prevents zooming on mobile, good for an app-like feel
    userScalable: false, // Optional: Paired with maximumScale
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* You can add other global tags here if needed, like custom fonts or scripts */}
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <div suppressHydrationWarning>
          <ThemeProvider>
            <SkillsProvider>
              {children}
              <ToastProvider />
            </SkillsProvider>
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}