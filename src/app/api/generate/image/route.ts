import OpenAI from "openai";
import { NextResponse } from "next/server";
import { getStylePack } from "@/lib/stylePacks";

export const runtime = "nodejs";
export const maxDuration = 60;

// POST /api/generate/image
// body: { prompt: string, styleId?: string, quality?: "low"|"medium"|"high" }
//
// We post-process the prompt to GUARANTEE the style suffix and avoid clause are
// present even if the upstream Claude response forgot them.
//
// Cost (April 2026):  low ≈ $0.011 · medium ≈ $0.042 · high ≈ $0.167 per image.
// Default: medium — at low quality, photoreal scenes lose a lot of detail.
//
// For absolute lowest cost ($0.003/img), set REPLICATE_API_TOKEN and switch the
// /studio image dropdown to Replicate Flux Schnell.
export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Set OPENAI_API_KEY in your Vercel environment." },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const rawPrompt: string = body.prompt;
  const style = getStylePack(body.styleId);
  const quality: "low" | "medium" | "high" = body.quality || "medium";

  if (!rawPrompt || typeof rawPrompt !== "string") {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 });
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // Build the final prompt: user prompt + style suffix + avoid clause.
  // Be defensive — only append the bits that aren't already in the prompt.
  const parts = [rawPrompt.trim()];
  if (!rawPrompt.toLowerCase().includes(style.promptSuffix.slice(0, 40).toLowerCase())) {
    parts.push(style.promptSuffix);
  }
  if (!rawPrompt.toLowerCase().includes("no watermark")) {
    parts.push(`Avoid: ${style.avoid}.`);
  }
  const finalPrompt = parts.join(" ").slice(0, 3800); // gpt-image-1 caps prompt around 4k chars

  const r = await client.images.generate({
    model: "gpt-image-1",
    prompt: finalPrompt,
    size: "1024x1536", // portrait 2:3, the closest 9:16-friendly size gpt-image-1 supports
    quality,
    n: 1,
  });

  const b64 = r.data?.[0]?.b64_json;
  if (!b64) {
    return NextResponse.json({ error: "No image returned" }, { status: 502 });
  }

  return NextResponse.json({
    dataUrl: `data:image/png;base64,${b64}`,
    finalPrompt,
    styleId: style.id,
    quality,
  });
}
