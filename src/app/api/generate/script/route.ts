import { NextResponse } from "next/server";

// Generate a 30-90s short-form script for a series episode.
// Production wiring: Anthropic Claude (claude-sonnet-4-6 or claude-opus-4-7).
//
// import Anthropic from "@anthropic-ai/sdk";
// const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
// const msg = await client.messages.create({
//   model: "claude-sonnet-4-6",
//   max_tokens: 1024,
//   system: "You write hook-driven faceless reel scripts. 30-60s. Hook in first 3s.",
//   messages: [{ role: "user", content: prompt }],
// });
export async function POST(req: Request) {
  const { niche, style, voice } = await req.json().catch(() => ({}));
  return NextResponse.json({
    script: `// stubbed script for ${niche} in ${style} narrated by ${voice}`,
    scenes: [],
  });
}
