import Anthropic from "@anthropic-ai/sdk";
import fs from "node:fs/promises";
import path from "node:path";
import { isDeskMode } from "@/lib/skills";

export const runtime = "nodejs";
export const maxDuration = 300;

type Turn = { role: "user" | "assistant"; content: string };

const CONSOLE_NOTE = `You are running inside Channel Console, the team's web console for their YouTube channel, not inside Claude Code.
You cannot run the Python tools the skill mentions and you cannot read files. When the skill says to run hookscore.py or title.py, write the options and tell the user to paste them into the console's Hook Lab or Packaging page, which run the same scoring.
The user's voice profile (their voice.md) is included below when they have filled it in. If it is missing, ask for it or for three of their own video transcripts, as the skill says, instead of guessing their voice.`;

async function skillPrompt(mode: string) {
  const file = path.join(process.cwd(), ".claude", "skills", mode, "SKILL.md");
  const raw = await fs.readFile(file, "utf8");
  return raw.replace(/^---[\s\S]*?---\s*/, ""); // drop the frontmatter
}

// POST /api/assist  { mode, messages: Turn[], voice?, channel? }  -> streamed plain text
export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "The AI desk needs ANTHROPIC_API_KEY set on the server." }, { status: 503 });
  }
  const body = await req.json().catch(() => null);
  const mode = String(body?.mode || "");
  const messages: Turn[] = Array.isArray(body?.messages)
    ? body.messages.filter((m: Turn) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    : [];
  if (!isDeskMode(mode)) return Response.json({ error: "Unknown mode." }, { status: 400 });
  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return Response.json({ error: "The last message must be from the user." }, { status: 400 });
  }

  const voice = typeof body?.voice === "string" && body.voice.trim() ? body.voice.trim() : "(not filled in yet)";
  const channel = typeof body?.channel === "string" && body.channel.trim() ? body.channel.trim() : "(not connected)";
  // Stable skill text first so it caches; per-user context after it.
  const system: Anthropic.Beta.BetaTextBlockParam[] = [
    { type: "text", text: `${CONSOLE_NOTE}\n\n${await skillPrompt(mode)}`, cache_control: { type: "ephemeral" } },
    { type: "text", text: `<voice_md>\n${voice}\n</voice_md>\n\n<channel_snapshot>\n${channel}\n</channel_snapshot>` },
  ];

  const client = new Anthropic();
  const stream = client.beta.messages.stream({
    model: "claude-opus-5-5",
    max_tokens: 64000,
    output_config: { effort: "high" },
    // On a safety-classifier decline the API re-runs the request on Anthropic's recommended fallback.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system,
    messages,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") controller.enqueue(encoder.encode("\n\n[The model declined this request.]"));
        else if (final.stop_reason === "max_tokens") controller.enqueue(encoder.encode("\n\n[Cut off at the length limit.]"));
      } catch (e) {
        const msg = e instanceof Anthropic.APIError ? `API error ${e.status}: ${e.message}` : "The request failed.";
        controller.enqueue(encoder.encode(`\n\n[${msg}]`));
      } finally {
        controller.close();
      }
    },
    cancel() { stream.abort(); },
  });
  return new Response(readable, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
}
