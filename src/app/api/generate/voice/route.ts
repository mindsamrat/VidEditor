import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

// POST /api/generate/voice
// body: { text: string, voice?: string, provider?: "openai" | "elevenlabs", speed?: number }
//
// Defaults to OpenAI TTS (cheapest, ~$0.015/min) using `gpt-4o-mini-tts` — narrator-grade.
// Falls back to ElevenLabs only if explicitly asked AND ELEVENLABS_API_KEY is set.
//
// Returns: { dataUrl, durationHint, provider }
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const text: string = body.text;
  const speed: number = Math.min(Math.max(Number(body.speed) || 1.0, 0.5), 1.5);
  const wantElevenlabs = body.provider === "elevenlabs";

  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  // ── ElevenLabs branch (only if explicitly requested + key present) ────────
  if (wantElevenlabs && process.env.ELEVENLABS_API_KEY) {
    const voiceId = body.voice || process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.45, similarity_boost: 0.75 },
      }),
    });
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      return NextResponse.json(
        { error: `ElevenLabs ${r.status}: ${t.slice(0, 400)}` },
        { status: 502 }
      );
    }
    const audio = Buffer.from(await r.arrayBuffer()).toString("base64");
    return NextResponse.json({
      dataUrl: `data:audio/mpeg;base64,${audio}`,
      provider: "elevenlabs",
    });
  }

  // ── OpenAI TTS (default) ──────────────────────────────────────────────────
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Set OPENAI_API_KEY in your Vercel environment." },
      { status: 500 }
    );
  }

  // OpenAI TTS voices: alloy, ash, ballad, coral, echo, fable, onyx, nova, sage, shimmer, verse
  const voice: string = body.voice || "onyx";

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const r = await client.audio.speech.create({
    model: "gpt-4o-mini-tts",
    voice,
    input: text,
    speed,
    response_format: "mp3",
  });
  const buffer = Buffer.from(await r.arrayBuffer());
  return NextResponse.json({
    dataUrl: `data:audio/mpeg;base64,${buffer.toString("base64")}`,
    provider: "openai",
  });
}
