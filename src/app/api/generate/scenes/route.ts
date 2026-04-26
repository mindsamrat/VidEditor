import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { getStylePack } from "@/lib/stylePacks";

export const runtime = "nodejs";
export const maxDuration = 60;

// POST /api/generate/scenes
// body: { script, sceneCount?, styleId? }
//
// Splits a USER-PROVIDED script into scenes — never rewrites the words. The
// only thing Claude generates here is the image prompt + caption for each
// scene, in the requested cinematic style.
export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "Set ANTHROPIC_API_KEY in your Vercel environment." },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const script: string = body.script;
  const sceneCount: number = Math.min(Math.max(Number(body.sceneCount) || 6, 3), 10);
  const style = getStylePack(body.styleId);

  if (!script || script.trim().length < 30) {
    return NextResponse.json({ error: "script is required (min 30 chars)" }, { status: 400 });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const system = SCENES_SYSTEM_PROMPT(style);

  const user = `Art style for image prompts: ${style.label}.
Target scene count: ${sceneCount}.

Source script (do not rewrite — split only):
"""
${script.trim()}
"""

Return ONLY the JSON.`;

  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 3000,
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
    const parsed = JSON.parse(text.slice(start, end + 1));
    return NextResponse.json({ ...parsed, styleId: style.id });
  } catch {
    return NextResponse.json({ error: "Bad JSON from model", raw: text }, { status: 502 });
  }
}

function SCENES_SYSTEM_PROMPT(style: ReturnType<typeof getStylePack>) {
  return `You split user-written faceless-reel scripts into cinematic scenes.

PART A — SPLITTING
- DO NOT rewrite the user's words. Preserve them verbatim. You may only break the
  script across scene boundaries and trim leading/trailing whitespace.
- The first scene's voiceover must be the script's opening hook.

PART B — IMAGE PROMPTS (you DO write these, in detail)
You are a cinematographer assembling a shot list for a 9:16 trailer.

RULE 1 — NO PROPER NAMES IN IMAGE PROMPTS.
Image models distort or refuse named people. Describe them physically instead.
  ❌ "Cleopatra reading a scroll"
  ✅ "A regal woman in her early thirties wearing a golden Egyptian headpiece and
      pleated white linen, kohl-lined almond eyes, lowered toward a papyrus scroll"

RULE 2 — EVERY IMAGE PROMPT INCLUDES (loosely in order):
  (i)   SUBJECT — age range, build, clothing/era, expression, posture, action.
  (ii)  ENVIRONMENT — place, era, weather, time of day.
  (iii) SHOT TYPE — pick ONE: extreme close-up · close-up · medium close-up ·
          medium · wide · extreme wide / establishing · over-the-shoulder ·
          point-of-view · low-angle hero · high-angle · Dutch tilt · push-in ·
          tracking · top-down · profile · two-shot.
  (iv)  LENS + DEPTH — focal length, T-stop, depth-of-field intent.
  (v)   LIGHTING — motivated and specific (Rembrandt key, golden-hour rim,
          single tungsten practical, neon cyan + amber bounce, etc.)
  (vi)  ATMOSPHERE — haze, dust, drifting smoke, rain, lens flares only if motivated.
  (vii) COMPOSITION — rule-of-thirds, leading lines, foreground depth element.

RULE 3 — VARY SHOT LANGUAGE across scenes like a trailer editor.

RULE 4 — END EVERY image_prompt with this exact avoidance line:
  "${style.avoid}"

RULE 5 — VERTICAL 9:16.

──────────── STYLE PACK ────────────
Style: ${style.label}
Append this style suffix at the end of every image_prompt (before the avoid line):

"${style.promptSuffix}"

${style.cinematographyRef}

──────────── OUTPUT ────────────
Return ONLY valid JSON. No prose.

{
  "title": "string, ≤70 chars, derived from the script",
  "hook": "the script's opening line, ≤15 words",
  "scenes": [
    {
      "scene": 1,
      "voiceover": "verbatim slice of the user's script for this scene",
      "image_prompt": "detailed cinematographer shot-list line per RULE 2, then style suffix, then avoid line",
      "on_screen_text": "≤8 words burn-in caption, derived from the voiceover"
    }
  ]
}`;
}
