import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { getStylePack } from "@/lib/stylePacks";

export const runtime = "nodejs";
export const maxDuration = 60;

type Word = { word: string; start: number; end: number };
type Segment = { text: string; start: number; end: number };
type Gap = { at: number; durationSec: number };

// POST /api/generate/scenes-from-audio
// body: {
//   words: Word[], segments?: Segment[], gaps?: Gap[],
//   sceneCount?: number, styleId?: string
// }
//
// Splits a user-uploaded audio (already transcribed by /api/transcribe) into
// timed scenes whose boundaries align to natural pauses in the speech.
// Claude picks word-index boundaries; we compute startSec/endSec from those.
//
// Returns: {
//   title, hook, styleId,
//   scenes: [{ scene, voiceover, image_prompt, on_screen_text, startSec, endSec }]
// }
export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "Set ANTHROPIC_API_KEY in your Vercel environment." },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const words: Word[] = Array.isArray(body.words) ? body.words : [];
  const segments: Segment[] = Array.isArray(body.segments) ? body.segments : [];
  const gaps: Gap[] = Array.isArray(body.gaps) ? body.gaps : [];
  const sceneCount: number = Math.min(Math.max(Number(body.sceneCount) || 6, 3), 12);
  const style = getStylePack(body.styleId);

  if (words.length < 5) {
    return NextResponse.json({ error: "Not enough transcribed words to plan scenes." }, { status: 400 });
  }

  // Build a numbered, timestamped transcript Claude can reason over.
  // Mark detected silence beats so Claude prefers cutting there.
  const beatSet = new Set(gaps.map((g) => roundTime(g.at)));
  const numbered = words
    .map((w, i) => {
      const beat = beatSet.has(roundTime(w.start)) ? "  ◀ beat" : "";
      return `${String(i + 1).padStart(3, " ")}. [${w.start.toFixed(2)}-${w.end.toFixed(2)}] ${w.word}${beat}`;
    })
    .join("\n");

  const segmentSummary = segments.length
    ? "\n\nWhisper segment boundaries (sentence-ish):\n" +
      segments
        .map((s, i) => `S${i + 1} [${s.start.toFixed(2)}-${s.end.toFixed(2)}]: ${s.text.trim()}`)
        .join("\n")
    : "";

  const totalDuration = words[words.length - 1]?.end || 0;

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const system = SYSTEM_PROMPT(style);

  const user = `Audio length: ${totalDuration.toFixed(1)} seconds.
Detected silence beats (cut-friendly): ${gaps.map((g) => g.at.toFixed(2)).join(", ") || "(none significant)"}.
Target scene count: ${sceneCount}.
Art style: ${style.label}.

Word-by-word transcript:
${numbered}${segmentSummary}

Return ONLY the JSON object described in the system prompt.`;

  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
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

  let parsed: {
    title?: string;
    hook?: string;
    scenes?: { scene: number; firstWordIndex: number; lastWordIndex: number; image_prompt: string; on_screen_text: string }[];
  };
  try {
    parsed = JSON.parse(text.slice(start, end + 1));
  } catch {
    return NextResponse.json({ error: "Bad JSON from model", raw: text }, { status: 502 });
  }
  if (!parsed.scenes?.length) {
    return NextResponse.json({ error: "No scenes returned", raw: text }, { status: 502 });
  }

  // Materialise: compute startSec / endSec / voiceover text from word indices.
  const scenes = parsed.scenes.map((s) => {
    const lo = clamp(s.firstWordIndex - 1, 0, words.length - 1);
    const hi = clamp(s.lastWordIndex - 1, lo, words.length - 1);
    const sliceWords = words.slice(lo, hi + 1);
    const voiceover = sliceWords.map((w) => w.word).join(" ").replace(/\s+([,.!?;:])/g, "$1").trim();
    return {
      scene: s.scene,
      voiceover,
      image_prompt: s.image_prompt,
      on_screen_text: s.on_screen_text,
      startSec: words[lo].start,
      endSec: words[hi].end,
    };
  });

  return NextResponse.json({
    title: parsed.title || "Untitled reel",
    hook: parsed.hook || scenes[0]?.voiceover.slice(0, 80) || "",
    styleId: style.id,
    scenes,
  });
}

function roundTime(t: number) {
  return Math.round(t * 100) / 100;
}
function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function SYSTEM_PROMPT(style: ReturnType<typeof getStylePack>) {
  return `You are a cinematographer planning a 9:16 reel from a USER-UPLOADED audio
recording. The user's voice and words are sacred — never rewrite them.

You are given:
  • A word-by-word transcript with timestamps.
  • A list of detected silence beats (gaps > 0.3s between words).
  • Optional Whisper sentence segments.

YOUR JOB
Pick scene boundaries. Boundaries should land at natural beats — the listed
silence gaps, sentence ends, or topic shifts. Avoid cutting mid-sentence or
mid-phrase.

Output exactly N scenes (target count provided). Each scene gets:
  • firstWordIndex / lastWordIndex (1-based, inclusive) referring to the
    numbered word list. The system will compute startSec/endSec from these.
  • A cinematic image_prompt that visually matches what is being said in
    that scene.
  • An on_screen_text caption (≤8 words) summarising the scene.

────────────── IMAGE-PROMPT RULES ──────────────
You are directing a trailer, not labelling a Wikipedia article.

RULE 1 — NO PROPER NAMES. The image model will refuse or distort named people.
Describe people physically: age range, build, clothing/era, expression,
posture, action.
  ❌ "Cleopatra reading a scroll"
  ✅ "A regal woman in her early thirties wearing a golden Egyptian headpiece
      and pleated white linen, kohl-lined almond eyes lowered toward a
      papyrus scroll"

RULE 2 — EVERY image_prompt MUST INCLUDE, in roughly this order:
  (i)   SUBJECT — age, build, clothing/era, expression, posture, action.
  (ii)  ENVIRONMENT — specific place, era, weather, time of day.
  (iii) SHOT TYPE — pick ONE: extreme close-up · close-up · medium close-up ·
          medium · cowboy · medium wide · wide · extreme wide / establishing ·
          over-the-shoulder · point-of-view · low-angle hero · high-angle ·
          Dutch tilt · push-in · tracking · top-down · profile · two-shot.
  (iv)  LENS + DEPTH — focal length, T-stop, depth-of-field intent.
  (v)   LIGHTING — motivated and specific (Rembrandt key from window left,
          golden-hour rim from behind, single tungsten practical, neon cyan
          key + amber bounce, etc.)
  (vi)  ATMOSPHERE — haze, dust, smoke, rain, lens flares only when motivated.
  (vii) COMPOSITION — rule-of-thirds, leading lines, foreground depth element.

RULE 3 — VARY SHOT LANGUAGE across scenes like a trailer editor. Don't open
with three close-ups. Wide → push-in → close-up reaction → over-the-shoulder
reveal → wide payoff is a strong cadence.

RULE 4 — END every image_prompt with this exact avoidance line:
  "${style.avoid}"

RULE 5 — VERTICAL 9:16 framing.

────────────── STYLE PACK ──────────────
Style: ${style.label}
Append this style suffix to every image_prompt (before the avoid line):

"${style.promptSuffix}"

${style.cinematographyRef}

────────────── OUTPUT ──────────────
Return ONLY valid JSON. No prose, no markdown fences.

{
  "title": "≤70 chars, derived from what the user said",
  "hook": "the user's opening line, ≤15 words",
  "scenes": [
    {
      "scene": 1,
      "firstWordIndex": 1,
      "lastWordIndex": 17,
      "image_prompt": "long, detailed shot-list line per RULE 2, then style suffix, then avoid line",
      "on_screen_text": "≤8 words"
    }
  ]
}

Boundary integrity: scene[1].firstWordIndex must be 1, scene[N].lastWordIndex
must be the final word number. Scene k+1's firstWordIndex must equal scene k's
lastWordIndex + 1. No gaps, no overlaps.`;
}
