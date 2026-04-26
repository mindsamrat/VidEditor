import { NextResponse } from "next/server";

// Synthesise voiceover for the script.
// Production wiring options:
//   - ElevenLabs (preferred for narrator quality + voice cloning).
//   - OpenAI TTS (gpt-4o-mini-tts).
//   - PlayHT.
//
// Example (ElevenLabs):
//   const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
//     method: "POST",
//     headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY!, "Content-Type": "application/json" },
//     body: JSON.stringify({ text, model_id: "eleven_multilingual_v2", voice_settings: { stability: 0.45, similarity_boost: 0.75 } }),
//   });
//   const audio = await r.arrayBuffer(); // upload to S3, return URL
export async function POST(req: Request) {
  const { text, voiceId } = await req.json().catch(() => ({}));
  return NextResponse.json({ audioUrl: null, text, voiceId });
}
