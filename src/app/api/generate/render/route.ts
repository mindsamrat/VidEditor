import { NextResponse } from "next/server";

// Compose images + voiceover + music + animated captions into a 9:16 MP4.
// Production wiring options:
//   - Remotion (self-host on AWS Lambda / @remotion/lambda).
//   - Shotstack API: https://shotstack.io
//   - Creatomate API: https://creatomate.com
//
// Caption alignment:
//   - Use forced-alignment via OpenAI Whisper (whisper-1 with word_timestamps)
//     or Deepgram, to time captions per word.
export async function POST(req: Request) {
  const { scenes, audioUrl, musicUrl, captionStyle } = await req.json().catch(() => ({}));
  return NextResponse.json({
    renderId: "render_" + Math.random().toString(36).slice(2, 9),
    status: "queued",
    scenes,
    audioUrl,
    musicUrl,
    captionStyle,
  });
}
