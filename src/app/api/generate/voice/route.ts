import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

// POST /api/generate/voice
// body: { text: string, voiceId?: string }
//
// Returns: { dataUrl: string }   (base64 MP3, ready to <audio src=...>)
//
// Defaults to a stock ElevenLabs voice ("Rachel"). Override with ELEVENLABS_VOICE_ID
// or pass voiceId in the request body.
export async function POST(req: Request) {
  if (!process.env.ELEVENLABS_API_KEY) {
    return NextResponse.json(
      { error: "Set ELEVENLABS_API_KEY in your Vercel environment." },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const text: string = body.text;
  const voiceId: string = body.voiceId || process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";

  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

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
    const errText = await r.text().catch(() => "");
    return NextResponse.json(
      { error: `ElevenLabs ${r.status}: ${errText.slice(0, 400)}` },
      { status: 502 }
    );
  }

  const audio = Buffer.from(await r.arrayBuffer()).toString("base64");
  return NextResponse.json({ dataUrl: `data:audio/mpeg;base64,${audio}` });
}
