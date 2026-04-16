import { NextRequest, NextResponse } from "next/server";

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

function localAnalyze(script: string, contentType: string) {
  // Smart local fallback: split script into scenes by sentences
  const sentences = script
    .replace(/([.!?])\s+/g, "$1|||")
    .split("|||")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  // Group sentences into scenes (1-3 sentences each)
  const scenes: {
    id: string;
    label: string;
    scriptText: string;
    imagePrompt: string;
  }[] = [];

  let sceneIndex = 1;
  let i = 0;

  while (i < sentences.length) {
    // Determine how many sentences for this scene
    const remaining = sentences.length - i;
    let groupSize: number;

    if (remaining <= 3) {
      groupSize = remaining;
    } else if (remaining === 4) {
      groupSize = 2;
    } else {
      groupSize = 2;
    }

    const sceneSentences = sentences.slice(i, i + groupSize);
    const scriptText = sceneSentences.join(" ");

    // Generate a descriptive label from the first few words
    const words = scriptText.split(/\s+/).slice(0, 5).join(" ");
    const label = words.length > 30 ? words.slice(0, 30) + "..." : words;

    // Generate a visual image prompt based on the content
    const mood = detectMood(scriptText);
    const imagePrompt = generateImagePrompt(scriptText, mood, contentType);

    scenes.push({
      id: `scene_${sceneIndex}`,
      label: `Scene ${sceneIndex}: ${label}`,
      scriptText,
      imagePrompt,
    });

    sceneIndex++;
    i += groupSize;
  }

  return {
    scenes,
    suggestedStyle:
      "Cinematic, moody, high contrast lighting with dark tones and dramatic compositions",
    estimatedDuration: Math.max(scenes.length * 4, 15),
  };
}

function detectMood(text: string): string {
  const lower = text.toLowerCase();
  if (
    lower.includes("respect") ||
    lower.includes("dignity") ||
    lower.includes("strength") ||
    lower.includes("power")
  )
    return "powerful and dramatic";
  if (
    lower.includes("love") ||
    lower.includes("heart") ||
    lower.includes("feel")
  )
    return "emotional and warm";
  if (
    lower.includes("dark") ||
    lower.includes("night") ||
    lower.includes("shadow")
  )
    return "dark and mysterious";
  if (
    lower.includes("happy") ||
    lower.includes("joy") ||
    lower.includes("bright") ||
    lower.includes("sun")
  )
    return "bright and uplifting";
  if (
    lower.includes("fight") ||
    lower.includes("battle") ||
    lower.includes("war")
  )
    return "intense and confrontational";
  if (
    lower.includes("silence") ||
    lower.includes("quiet") ||
    lower.includes("walk")
  )
    return "contemplative and serene";
  if (
    lower.includes("money") ||
    lower.includes("business") ||
    lower.includes("success")
  )
    return "ambitious and sleek";
  return "cinematic and evocative";
}

function generateImagePrompt(
  text: string,
  mood: string,
  contentType: string
): string {
  const lower = text.toLowerCase();
  const style =
    contentType === "reel" || contentType === "youtube_short"
      ? "vertical composition, mobile-optimized framing"
      : "wide cinematic composition";

  let subject = "A solitary figure in a dramatic setting";

  if (lower.includes("room") || lower.includes("walk"))
    subject = "A person walking away through a doorway, silhouetted";
  else if (lower.includes("laugh") || lower.includes("joke"))
    subject = "A group of people, one person standing apart with quiet dignity";
  else if (lower.includes("respect") || lower.includes("pattern"))
    subject =
      "An abstract visual of a person standing tall amid falling dominos";
  else if (lower.includes("silence") || lower.includes("reclaim"))
    subject = "A person standing alone on a hilltop at golden hour";
  else if (lower.includes("stop") || lower.includes("start"))
    subject =
      "A powerful close-up portrait with intense eye contact, face half in shadow";
  else if (lower.includes("trained") || lower.includes("flinch"))
    subject = "A person's reflection in broken mirror pieces, moody lighting";
  else if (lower.includes("price") || lower.includes("lower"))
    subject = "Hands releasing something precious into the wind";
  else if (lower.includes("voice") || lower.includes("interrupt"))
    subject =
      "A person in a crowded room, standing while everyone else sits, dramatic spotlight";
  else if (lower.includes("perform") || lower.includes("small"))
    subject = "A lone figure casting a giant shadow on the wall behind them";

  return `${subject}. ${mood} mood. ${style}. Shot on 35mm film, shallow depth of field, rich contrast, volumetric lighting, dark moody color palette with hints of gold. Professional photography, editorial quality.`;
}

export async function POST(request: NextRequest) {
  try {
    const { script, contentType } = await request.json();

    if (!script || typeof script !== "string" || script.trim().length === 0) {
      return NextResponse.json(
        { error: "Script text is required" },
        { status: 400 }
      );
    }

    // Check for API key — use local fallback if not available
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      console.log("No ANTHROPIC_API_KEY set — using local script analysis");
      const result = localAnalyze(script, contentType || "custom");
      return NextResponse.json(result);
    }

    // Use Claude API
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey });

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
