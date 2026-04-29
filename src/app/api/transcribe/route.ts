import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

// POST /api/transcribe
// Accepts a multipart form with an "audio" File. Sends to OpenAI Whisper
// (whisper-1) at $0.006 per minute. Returns:
//   { text, language, duration, words: [{ word, start, end }],
//     segments: [{ text, start, end }], gaps: [{ at, durationSec }] }
//
// `gaps` are silence intervals > 0.3s between consecutive words — those are
// the natural beats where a scene cut feels right. The downstream scene
// planner uses them to align scene boundaries to actual pauses in the audio.
//
// Limits:
//   - OpenAI Whisper accepts up to 25 MB per request.
//   - Vercel's serverless body limit is 4.5 MB on Hobby (≈3-4 min of mp3).
//     For longer files, switch the client to upload to Vercel Blob first
//     and POST the Blob URL — easy follow-up if you ever need it.
export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Set OPENAI_API_KEY in your Vercel environment." },
      { status: 500 }
    );
  }

  const fd = await req.formData().catch(() => null);
  const file = fd?.get("audio") as File | null;
  if (!file) {
    return NextResponse.json({ error: "Upload a file under the 'audio' field." }, { status: 400 });
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  let r;
  try {
    r = await client.audio.transcriptions.create({
      file,
      model: "whisper-1",
      response_format: "verbose_json",
      timestamp_granularities: ["word", "segment"],
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 502 }
    );
  }

  // OpenAI types are loose for verbose_json — cast.
  const v = r as unknown as {
    text: string;
    language?: string;
    duration?: number;
    words?: { word: string; start: number; end: number }[];
    segments?: { text: string; start: number; end: number }[];
  };

  const words = v.words || [];
  // Detect natural beats: silence gaps > 300ms between consecutive words.
  const gaps: { at: number; durationSec: number }[] = [];
  for (let i = 1; i < words.length; i++) {
    const gap = words[i].start - words[i - 1].end;
    if (gap > 0.3) gaps.push({ at: words[i].start, durationSec: gap });
  }

  return NextResponse.json({
    text: v.text,
    language: v.language || "en",
    duration: v.duration || 0,
    words,
    segments: v.segments || [],
    gaps,
  });
}
