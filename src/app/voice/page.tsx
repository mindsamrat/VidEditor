"use client";
import { useVoice } from "@/lib/store";
import { VOICE_TEMPLATE } from "@/lib/voiceTemplate";
import { Card, CopyButton, PageHeader } from "@/components/ui";

export default function Voice() {
  const [voice, setVoice, ready] = useVoice();
  return (
    <>
      <PageHeader title="Voice" sub="Ten minutes here is worth more than any prompt. Every AI Desk mode reads this before writing, because on YouTube we have to say the words out loud.">
        <CopyButton text={voice} label="Copy voice.md" />
        {!voice.trim() && ready && <button className="btn-primary" onClick={() => setVoice(VOICE_TEMPLATE)}>Start from the template</button>}
      </PageHeader>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <textarea className="input min-h-[60vh] font-mono text-sm leading-relaxed" value={voice} onChange={(e) => setVoice(e.target.value)}
            placeholder="Start from the template, or paste three of our own transcripts into the AI Desk and ask it to write this file." spellCheck />
          <p className="mt-2 text-xs text-ink-mute">{voice.trim().split(/\s+/).filter(Boolean).length} words · saved in this browser</p>
        </Card>
        <div className="space-y-4">
          <Card title="Shortcut">
            <p className="text-sm text-ink-dim">Open the AI Desk in any mode, paste three of our transcripts, and say “write our voice.md from these”. Paste the result back here.</p>
          </Card>
          <Card title="Also for Claude Code">
            <p className="text-sm text-ink-dim">The <code className="text-ink">/yt-*</code> skills in this repo read <code className="text-ink">~/.claude/youtube/voice.md</code>. Copy this there so both say the same thing.</p>
          </Card>
        </div>
      </div>
    </>
  );
}
