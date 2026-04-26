import { NextResponse } from "next/server";

// Generate one image per scene in the chosen art style.
// Production wiring options:
//   - Replicate (SDXL, Flux): https://replicate.com
//   - fal.ai (fal-ai/flux/dev, fal-ai/flux-pro): https://fal.ai
//   - Stability AI: https://platform.stability.ai
//
// Example (Replicate):
//   import Replicate from "replicate";
//   const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN! });
//   const out = await replicate.run("black-forest-labs/flux-schnell", {
//     input: { prompt, aspect_ratio: "9:16" },
//   });
export async function POST(req: Request) {
  const { prompt, style } = await req.json().catch(() => ({}));
  return NextResponse.json({ imageUrl: null, prompt, style });
}
