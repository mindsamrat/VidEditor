import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

// POST /api/generate/script
// body: { topic: string, niche?: string, voice?: string, sceneCount?: number }
//
// Returns:
// {
//   title: string,
//   hook: string,
//   scenes: { scene: number, voiceover: string, image_prompt: string, on_screen_text: string }[]
// }
export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "Set ANTHROPIC_API_KEY in your Vercel environment." },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const topic: string = body.topic || "An interesting fact about the universe";
  const niche: string = body.niche || "facts";
  const voice: string = body.voice || "documentary narrator";
  const sceneCount: number = Math.min(Math.max(Number(body.sceneCount) || 6, 3), 8);

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const system = `You write hook-driven scripts for short-form faceless reels (TikTok / Instagram Reels / YouTube Shorts).

Hard rules:
- 35–55 seconds total when read aloud at a natural pace.
- Hook lands in the first 3 seconds. Make the viewer need to know.
- Plain spoken English. No stage directions in the voiceover.
- Each scene must include a vivid 9:16 image prompt that visually matches the line.
- Output ONLY valid JSON matching the schema. No prose before or after.`;

  const user = `Niche: ${niche}
Narrator vibe: ${voice}
Topic: ${topic}
Number of scenes: ${sceneCount}

Return JSON:
{
  "title": "string, <= 70 chars",
  "hook": "the first spoken line, max 15 words",
  "scenes": [
    {
      "scene": 1,
      "voiceover": "what the narrator says for this scene",
      "image_prompt": "detailed 9:16 vertical image prompt, no text in image",
      "on_screen_text": "short caption to burn in, max 8 words"
    }
  ]
}`;

  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system,
    messages: [{ role: "user", content: user }],
  });

  const text = msg.content
    .filter((c): c is Anthropic.TextBlock => c.type === "text")
    .map((c) => c.text)
    .join("\n");

  const jsonStart = text.indexOf("{");
  const jsonEnd = text.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1) {
    return NextResponse.json({ error: "Model did not return JSON", raw: text }, { status: 502 });
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
  } catch {
    return NextResponse.json({ error: "Bad JSON from model", raw: text }, { status: 502 });
  }

  return NextResponse.json(parsed);
}
