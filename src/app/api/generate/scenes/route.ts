import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

// POST /api/generate/scenes
// body: { script: string, sceneCount?: number, style?: string }
//
// Splits a user-provided script into N scenes with image prompts, without
// rewriting the script itself. Output matches /api/generate/script's shape so
// the rest of the pipeline doesn't care which mode was used.
//
// Returns: { title, hook, scenes: [{scene, voiceover, image_prompt, on_screen_text}] }
export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "Set ANTHROPIC_API_KEY in your Vercel environment." },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const script: string = body.script;
  const style: string = body.style || "cinematic realism";
  const sceneCount: number = Math.min(Math.max(Number(body.sceneCount) || 6, 3), 10);

  if (!script || script.trim().length < 30) {
    return NextResponse.json({ error: "script is required (min 30 chars)" }, { status: 400 });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const system = `You split user-written faceless-reel scripts into scenes.

Hard rules:
- DO NOT rewrite the user's words. Preserve them exactly. You may only break the script across scene boundaries and trim leading/trailing whitespace.
- The first scene's voiceover must be the script's opening hook.
- Generate one vivid 9:16 image prompt per scene that visually matches what's being said.
- Output ONLY valid JSON. No prose before or after.`;

  const user = `Art style for image prompts: ${style}
Target scene count: ${sceneCount}
Source script:
"""
${script.trim()}
"""

Return JSON:
{
  "title": "string, <= 70 chars, derived from the script",
  "hook": "the script's opening line, max 15 words",
  "scenes": [
    {
      "scene": 1,
      "voiceover": "verbatim slice of the user's script for this scene",
      "image_prompt": "detailed 9:16 vertical image prompt, no text in image",
      "on_screen_text": "short caption to burn in, max 8 words, derived from the voiceover"
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

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) {
    return NextResponse.json({ error: "Model did not return JSON", raw: text }, { status: 502 });
  }
  try {
    return NextResponse.json(JSON.parse(text.slice(start, end + 1)));
  } catch {
    return NextResponse.json({ error: "Bad JSON from model", raw: text }, { status: 502 });
  }
}
