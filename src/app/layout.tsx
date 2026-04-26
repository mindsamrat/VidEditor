import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "ReelForge — AI Faceless Reels on Auto-Pilot",
  description:
    "ReelForge generates faceless short-form videos and auto-posts them to TikTok, Instagram and YouTube. Pick a niche, set a series, and the AI ships videos while you sleep.",
  openGraph: {
    title: "ReelForge — AI Faceless Reels on Auto-Pilot",
    description:
      "Pick a niche. The AI writes scripts, generates visuals, voices it, edits it, and posts to TikTok, Instagram and YouTube.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-bg text-ink`}
      >
        {children}
      </body>
    </html>
  );
}
