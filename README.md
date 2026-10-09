# Channel Console

The control room for our YouTube channel. Live channel numbers, outlier tracking against our
own baseline and our competitors', and the writing and editing tools from the
[`yt-*` skills](.claude/skills), wired into one web app.

**It's read-only.** The console reads public YouTube data with an API key. It can't upload,
edit or post anything. Everything it writes ends in a block you copy, and we upload.

## Pages

| Page | What it does |
| --- | --- |
| **Overview** | Subscribers, views, upload rhythm, views per upload against our median (long-form and Shorts are kept separate), each video's multiple of that median, a title lint score and title formula, the outlier worth studying, and the weakest recent title. |
| **Competitors** | Add channels, pull their last 30 uploads each, and rank every video by how far it beat *its own* channel's median. Shows which title formulas the outliers use. |
| **Hook Lab** | Scores hooks on specificity, address, stakes, curiosity and brevity, ranks them, names the formula, and suggests a fix for the weakest property. Also browses the 21 formulas. |
| **Packaging** | Lints each title and thumbnail-text pair for truncation, duplicated words, vagueness, missing numbers and all-caps. Includes a mock feed preview. |
| **AI Desk** | Claude runs one of eight skills (script, package, SEO, Shorts, comments, plan, audit, retention), with our `voice.md` and a live channel snapshot as context. |
| **Edit List** | Turns an SRT/VTT/Whisper transcript into an edit decision list: dead air, filler, retakes. Exports as text or CSV. |
| **Chapters** | Finds chapter boundaries from pauses and topic shifts, checks them against YouTube's rules (starts at 0:00, at least 3, each at least 10s), and lets you retitle each line. |
| **Retention** | Reads a Studio audience-retention CSV and reports the hook leak, the cliffs (with what was being said at each one, if you add a transcript) and the slide. |
| **Week Plan** | One anchor, one cheap video, Shorts cut from the anchor. Checks the plan against the hours you actually have. |
| **Voice** | The `voice.md` profile that every AI Desk mode reads. |

The scoring tools are TypeScript ports of the skills' Python scripts. They read the same
`hooks.json` and give the same results on the same input.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in the keys below
npm run dev                  # http://localhost:3000
```

| Variable | Needed for |
| --- | --- |
| `YOUTUBE_API_KEY` | Overview and Competitors. Get it from Google Cloud → APIs & Services → Credentials, and enable **YouTube Data API v3**. Optional on the server: each person can paste their own key in Settings, where it stays in their browser. |
| `NEXT_PUBLIC_DEFAULT_CHANNEL` | Optional. Our `@handle`, so Settings starts filled in. |
| `ANTHROPIC_API_KEY` | AI Desk only. Every other page works without it. |

It deploys to Vercel as-is. Drafts, plans and settings live in each browser's local storage.
There's no database and no login, so don't put it on a public URL you wouldn't want others using
your API quota on. Put it behind Vercel's password protection or deploy it privately.

## Claude Code

The `/yt-*` skills in [`.claude/skills`](.claude/skills) also work directly in Claude Code
inside this repo. Vendored from
[Jakeschincariol/youtube-agent-skill](https://github.com/Jakeschincariol/youtube-agent-skill),
MIT licensed ([licence](.claude/skills/YT-SKILLS-LICENSE)).
