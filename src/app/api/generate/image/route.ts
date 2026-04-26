import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

// POST /api/generate/image
// body: { prompt: string, style?: string, quality?: "low" | "medium" | "high" }
//
// Returns: { dataUrl: string }   (base64 PNG, 1024x1536, ready to <img src=...>)
//
// Notes:
//  - Uses OpenAI gpt-image-1 at portrait 1024x1536 (9:16-ish for vertical reels).
//  - Cost (April 2026): "low" ≈ $0.011/image, "medium" ≈ $0.042, "high" ≈ $0.167.
//  - For drastically cheaper images (~$0.003 each) swap to Replicate Flux Schnell.
export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Set OPENAI_API_KEY in your Vercel environment." },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const prompt: string = body.prompt;
  const style: string = body.style || "cinematic realism, shallow depth of field, film grain";
  const quality: "low" | "medium" | "high" = body.quality || "low";

  if (!prompt || typeof prompt !== "string") {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 });
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const fullPrompt = `${prompt}. Art direction: ${style}. Vertical 9:16 composition. No text, no watermark, no logos.`;

  const r = await client.images.generate({
    model: "gpt-image-1",
    prompt: fullPrompt,
    size: "1024x1536",
    quality,
    n: 1,
  });

  const b64 = r.data?.[0]?.b64_json;
  if (!b64) {
    return NextResponse.json({ error: "No image returned" }, { status: 502 });
  }

  return NextResponse.json({
    dataUrl: `data:image/png;base64,${b64}`,
    prompt: fullPrompt,
  });
}
