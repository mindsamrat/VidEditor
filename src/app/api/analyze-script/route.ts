import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are a video production assistant. Given a script, split it into visual scenes for a video.

Rules:
- Each scene should be 1-3 sentences from the script
- Each scene gets an image prompt that would work with Flux image generation
- Image prompts should be specific, visual, cinematic — describe lighting, composition, mood, style
- Maintain visual consistency across scenes (same style descriptors)
- Return valid JSON only, no markdown

Return format:
{
  "scenes": [
    {
      "id": "scene_1",
      "label": "Short scene title",
      "scriptText": "The exact script text for this scene",
      "imagePrompt": "Detailed image generation prompt"
    }
  ],
  "suggestedStyle": "A brief style note for visual consistency",
  "estimatedDuration": 30
}`;

export async function POST(request: NextRequest) {
  try {
    const { script, contentType } = await request.json();

    if (!script || typeof script !== "string" || script.trim().length === 0) {
      return NextResponse.json(
        { error: "Script text is required" },
        { status: 400 }
      );
    }

    const userMessage = `Content type: ${contentType || "custom"}

Script:
${script}`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [{ role: "user", content: userMessage }],
      system: SYSTEM_PROMPT,
    });

    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "No text response from Claude" },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(textBlock.text);
    return NextResponse.json(parsed);
  } catch (error: unknown) {
    console.error("Script analysis error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to analyze script";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
