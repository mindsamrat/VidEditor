# ReelForge

**AI faceless reels on auto-pilot.** Pick a niche, the AI writes scripts,
generates visuals, voices them, edits them, and posts to TikTok, Instagram and
YouTube — every day, while you sleep.

A faithful, re-branded clone of the [facelessreels.com](https://facelessreels.com)
mechanic. Built on **Next.js 14 (App Router) + TypeScript + Tailwind CSS**.

> Branding only is changed (name, logo, colour palette). The product mechanic —
> pick a niche → set a Series → AI generates and auto-posts to TikTok / IG / YT
> on a schedule — is identical.

---

## What's in this repo

```
src/
├─ app/
│  ├─ page.tsx                      # Marketing home (hero, niches, features, pricing, FAQ, testimonials, CTA)
│  ├─ pricing/page.tsx              # Pricing + comparison table
│  ├─ faq/page.tsx                  # FAQ
│  ├─ login/page.tsx                # Sign-in
│  ├─ signup/page.tsx               # Sign-up
│  ├─ terms/page.tsx                # Terms of service
│  ├─ privacy/page.tsx              # Privacy policy
│  ├─ affiliate/page.tsx            # Affiliate program
│  ├─ dashboard/
│  │  ├─ layout.tsx                 # Sidebar shell
│  │  ├─ page.tsx                   # Overview (stats, series table, queue, recent)
│  │  ├─ create/page.tsx            # 7-step Create Series wizard (the core mechanic)
│  │  ├─ series/page.tsx            # Series list
│  │  ├─ series/[id]/page.tsx       # Series detail (queue, perf, danger zone)
│  │  ├─ library/page.tsx           # All generated videos with status
│  │  ├─ calendar/page.tsx          # Weekly posting calendar
│  │  ├─ accounts/page.tsx          # Connected social accounts
│  │  ├─ billing/page.tsx           # Open-beta status + bring-your-own-key panel
│  │  └─ settings/page.tsx          # Profile, notifications, brand kit, danger zone
│  ├─ studio/page.tsx               # ★ Live playground — test script + image + voice with your keys
│  └─ api/
│     ├─ auth/[...nextauth]/        # NextAuth handler (stub)
│     ├─ connect/[platform]/        # Social OAuth connect (stub)
│     ├─ series/                    # Series CRUD (stub)
│     ├─ videos/                    # List videos (stub)
│     ├─ generate/script/           # Claude — script writer (LIVE)
│     ├─ generate/scenes/           # Claude — splits a user-provided script into scenes (LIVE)
│     ├─ generate/image/            # OpenAI gpt-image-1 — visuals (LIVE)
│     ├─ generate/voice/            # OpenAI TTS (default) / ElevenLabs (opt-in) (LIVE)
│     ├─ generate/render/           # Remotion / Shotstack / Creatomate (stub)
│     ├─ post/tiktok/               # TikTok Content Posting API (stub)
│     ├─ post/instagram/            # Instagram Graph API (stub)
│     └─ post/youtube/              # YouTube Data API v3 (stub)
├─ components/
│  ├─ marketing/  (Navbar, Footer, Hero, LogoCloud, HowItWorks, Features, Niches, Showcase, Pricing, Testimonials, FAQ, CTA, Logo)
│  └─ dashboard/  (Sidebar, TopBar)
└─ lib/
   ├─ brand.ts                      # Brand constants — change name/colours here
   └─ data.ts                       # Niches, art styles, voices, plans, FAQs, testimonials
```

The **core mechanic** lives in `src/app/dashboard/create/page.tsx` —
the 7-step wizard (Niche → Style → Voice → Music → Schedule → Accounts → Review)
that creates a Series. The Series is then "fed" by the API pipeline below.

---

## Run it

```bash
npm install
npm run dev
# open http://localhost:3000
```

The marketing site, dashboard pages and Create-Series wizard run with zero env
vars. To use the **`/studio` live playground** (script → image → voice with
your own keys) set the three required env vars below.

### Tier 1 — required for the studio pipeline

The studio works end-to-end with just these two:

| Variable | Provider | Used for |
|---|---|---|
| `ANTHROPIC_API_KEY` | [Anthropic](https://console.anthropic.com) | Script writing + splitting your pasted scripts into scenes (Claude Sonnet 4.6) |
| `OPENAI_API_KEY` | [OpenAI](https://platform.openai.com) | Image generation (`gpt-image-1`) + voiceover (`gpt-4o-mini-tts`, ~$0.015/min) |

With only these set, you can compose and download finished MP4s — but they're
not saved anywhere; you just download them.

### Tier 2 — required to save videos to your library

| Variable | Provider | Used for |
|---|---|---|
| `DATABASE_URL` | Vercel Postgres / Neon | Stores users, series, videos |
| `AUTH_SECRET` | self (`openssl rand -base64 32`) | NextAuth JWT signing |
| `GOOGLE_CLIENT_ID` | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) | Sign in with Google |
| `GOOGLE_CLIENT_SECRET` | same | same |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob (auto-set by Vercel when enabled) | Stores finished MP4s |

If any of Tier 2 is missing, the app degrades gracefully — sign-in falls through
to anonymous mode and "save to library" politely says "set up the DB to save".

### Tier 3 — optional upgrades

| Variable | Why you'd set it |
|---|---|
| `ELEVENLABS_API_KEY` | Premium narrator voice. Toggle "ElevenLabs" in the studio voice dropdown. |
| `REPLICATE_API_TOKEN` | Swap images to Flux Schnell (~$0.003/img, 4× cheaper than OpenAI). |

---

## Picking the right OpenAI voice

The `/studio` voice dropdown defaults to `onyx` because it suits the most
common faceless niches (mythology, true crime, history). Pick by content:

| Voice | When to use |
|---|---|
| **Onyx** | Documentary · true crime · mythology · history. Deep, authoritative. |
| **Ash** | Luxury · history · explainer. Warm baritone. |
| **Echo** | News · tech · hype. Clear, articulate male. |
| **Verse** | Motivation · stoic · sports. Dramatic male. |
| **Fable** | Storytelling · fairy tales. British male. |
| **Ballad** | ASMR-adjacent · reflective. Soft, expressive male. |
| **Nova** | Explainer · lifestyle. Energetic female. |
| **Sage** | Psychology · wellness. Calm, thoughtful female. |
| **Coral** | Personal stories. Warm, expressive female. |
| **Shimmer** | Calm / ASMR-adjacent. Soft female. |
| **Alloy** | Neutral all-rounder. |

OpenAI TTS pricing (`gpt-4o-mini-tts`): ~$0.015 per spoken minute. A 60-second
reel costs ~$0.015. ElevenLabs at the same length is ~$0.18.

---

## Picking the right image model

The `/studio` image route is wired to **OpenAI gpt-image-1** by default — easy
because you already have the key. The quality dropdown picks the cost tier.

| Model | Cost / 1024×1536 image | Quality (cinematic realism) | When to pick |
|---|---|---|---|
| OpenAI `gpt-image-1` low | ~$0.011 | OK — text on cards, simple subjects | Quick iteration |
| **OpenAI `gpt-image-1` medium** *(default)* | **~$0.042** | **Strong photoreal, this is the sweet spot** | Most reels |
| OpenAI `gpt-image-1` high | ~$0.167 | Excellent | Hero shots, premium niches |
| Replicate **Flux Schnell** | ~$0.003 | Decent for stylised; weaker for photoreal humans | High-volume cheap factory |
| Replicate **Flux Dev** | ~$0.025 | Strong, faster than gpt-image-1 medium | Volume + photoreal |
| Replicate **Flux 1.1 Pro Ultra** | ~$0.05 | **Top-tier photoreal, our recommended cinematic realism choice** | Flagship channels |
| fal.ai **Flux Pro** | ~$0.05 | Same as above, faster cold start | Same |
| Google **Imagen 3** | ~$0.04 | Strong faces, slightly more "stock photo" feel | Lifestyle / luxury |

**Cheapest decent option:** OpenAI `gpt-image-1` low at $0.011.
**Best price/quality balance:** OpenAI `gpt-image-1` medium at $0.042.
**Best cinematic realism:** Flux 1.1 Pro Ultra on Replicate at ~$0.05 — once you set `REPLICATE_API_TOKEN` in Vercel envs, ask me to wire the alternate image route and the studio dropdown will offer it.

### Per-video cost (6-scene, ~60-second reel)

| Stack | Cost |
|---|---|
| Cheapest (OpenAI low + OpenAI TTS) | ~$0.08 |
| **Default (OpenAI medium + OpenAI TTS)** | **~$0.27** |
| Premium (Flux Pro Ultra + ElevenLabs) | ~$0.48 |

### Vercel deploy walkthrough

1. **Import the repo** at https://vercel.com/new → branch `claude/clone-facelessreels-site-aEYUr` (or `main` after merging).
2. **Storage → Create Database → Postgres** (free tier). Vercel auto-injects `DATABASE_URL`, `POSTGRES_URL` etc.
3. **Storage → Create Blob Store**. Vercel auto-injects `BLOB_READ_WRITE_TOKEN`.
4. **Settings → Environment Variables**: add `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
5. **Google Cloud Console** → OAuth consent screen + Credentials → add the redirect URI `https://<your-domain>.vercel.app/api/auth/callback/google`.
6. **Push migrations**: from your laptop, `DATABASE_URL=… npx prisma db push` (or wire it into Vercel's deploy command).
7. **Redeploy**. Done.

The app is **free during open beta** — no Stripe, no paywall, no subscription
gating. You only pay your AI providers for what you actually generate.

---

## The video-generation pipeline

For every episode of a Series, the backend runs:

```
 ┌── 1. SCRIPT ──────────────┐  Anthropic Claude (recommended) or OpenAI GPT
 │   30-60s, hook in 3s,     │  Output: scenes[] with on-screen text + image prompts
 │   tuned to the niche      │
 └────────────┬──────────────┘
              │
 ┌── 2. IMAGES ──────────────┐  Replicate (Flux / SDXL) or fal.ai or Stability
 │   1 image per scene,      │  Output: signed URLs, 9:16
 │   in the chosen art style │
 └────────────┬──────────────┘
              │
 ┌── 3. VOICEOVER ───────────┐  ElevenLabs (multilingual_v2) — best voice quality
 │   AI narrator reads       │  Or OpenAI TTS, PlayHT
 │   the script              │  Output: MP3 / WAV
 └────────────┬──────────────┘
              │
 ┌── 4. MUSIC BED ───────────┐  Library / user upload / TikTok-sound link
 │   Royalty-free or custom  │  Output: looped MP3
 └────────────┬──────────────┘
              │
 ┌── 5. CAPTIONS ────────────┐  OpenAI Whisper or Deepgram (word-level timestamps)
 │   Word-by-word burned in  │  Output: ASS / animated overlay timeline
 └────────────┬──────────────┘
              │
 ┌── 6. RENDER ──────────────┐  Remotion Lambda  OR  Shotstack  OR  Creatomate
 │   Compose into 9:16 MP4   │  Output: MP4 in S3 / R2
 └────────────┬──────────────┘
              │
 ┌── 7. SCHEDULE + POST ─────┐  Inngest / Trigger.dev cron at user's time-of-day
 │   Push to each platform   │  TikTok / Instagram / YouTube via official APIs
 └───────────────────────────┘
```

---

## All APIs / external services you need

Every external dependency, grouped by job-to-be-done. Free-tier viable for
prototype, paid in production.

### 🔐 Auth
| Service | What it does | Why |
|---|---|---|
| **NextAuth.js (Auth.js)** | Email + OAuth login | Open source, plug-and-play with Next.js |
| **Clerk** *(alternative)* | Hosted auth + UI | Faster MVP, paid past free tier |
| **Google OAuth** | Sign in with Google | Lowest friction signup |

### 🗄️ Database
| Service | What it does |
|---|---|
| **PostgreSQL** (Supabase / Neon / Railway) | Users, series, videos, jobs, social accounts, billing |
| **Prisma** or **Drizzle** | ORM/migrations |
| **Redis** (Upstash) | Rate limiting, queue locks, caching |

### 🧠 AI: scripts (LLM)
| Service | Use it for | API |
|---|---|---|
| **Anthropic Claude** | Hook-driven script writing | `@anthropic-ai/sdk` — `claude-sonnet-4-6` is the right default; upgrade to `claude-opus-4-7` for premium niches |
| **OpenAI GPT** *(alternative)* | Same | `openai` SDK — `gpt-4o` / `gpt-4o-mini` |

### 🖼️ AI: images / b-roll
| Service | Use it for |
|---|---|
| **Replicate** | Run Flux Schnell / Flux Dev / SDXL via one API |
| **fal.ai** | Faster cold-start, good Flux endpoints |
| **Stability AI** | SD3 / SD Ultra |
| **Midjourney** *(unofficial)* | Highest aesthetic quality, no public API — use a relay service |

### 🎙️ AI: voice (TTS)
| Service | Use it for |
|---|---|
| **ElevenLabs** | **Recommended.** Best narrator voices + voice cloning for the Scale plan |
| **OpenAI TTS** | Cheap fallback, decent quality |
| **PlayHT** | Alternative cloning provider |

### 🎵 Music
| Service | Use it for |
|---|---|
| **Mubert API** | AI-generated royalty-free tracks per mood |
| **Pixabay Music API** | Free royalty-free library |
| **Soundstripe** | Curated catalogue |
| **TikTok Sound** | Resolved client-side from a TikTok music URL the user pastes |

### 📝 Captions / forced alignment
| Service | Use it for |
|---|---|
| **OpenAI Whisper** (`whisper-1`, word_timestamps) | Word-level caption timing |
| **Deepgram** | Faster, cheaper alternative |

### 🎬 Video render
| Service | Use it for |
|---|---|
| **Remotion + @remotion/lambda** | Self-host on AWS Lambda. React-based templates, full control. **Recommended for serious scale.** |
| **Shotstack** | Hosted render API, JSON timelines |
| **Creatomate** | Hosted render API, template-driven |

### 📦 Storage / CDN
| Service | Use it for |
|---|---|
| **AWS S3** or **Cloudflare R2** | Store images, audio, MP4s |
| **Cloudflare CDN** | Public delivery of finished videos |

### ⚙️ Background jobs / scheduler
| Service | Use it for |
|---|---|
| **Inngest** | **Recommended.** Step functions + cron + retries; fits the multi-stage pipeline perfectly |
| **Trigger.dev** | Alternative |
| **BullMQ + Redis** | DIY route |

### 📲 Social posting (the hard part)
| Service | Use it for | Notes |
|---|---|---|
| **TikTok Content Posting API** | Auto-post to TikTok | Requires app review for `video.publish` scope. Use the resumable upload flow. [docs](https://developers.tiktok.com/doc/content-posting-api-get-started) |
| **Instagram Graph API** | Auto-post Reels | Requires a Meta Business account + IG-Business linked. `instagram_content_publish` permission. [docs](https://developers.facebook.com/docs/instagram-platform/content-publishing) |
| **YouTube Data API v3** | Auto-post Shorts | Use `videos.insert` resumable upload. Add `#shorts` to the title. [docs](https://developers.google.com/youtube/v3/docs/videos/insert) |

> All three platforms require an OAuth app and review for posting scopes —
> this is the longest-lead-time piece of going live. Start the app review
> processes early.

### 💳 Payments
| Service | Use it for |
|---|---|
| **Stripe** | Subscriptions ($19 / $39 / $69), usage-based add-ons, customer portal, invoices |

### ✉️ Email
| Service | Use it for |
|---|---|
| **Resend** | Transactional (welcome, video-ready, payment failed, weekly digest) |
| **Postmark** *(alt)* | Same |

### 📊 Analytics + product feedback
| Service | Use it for |
|---|---|
| **PostHog** | Product analytics + feature flags + session replay |
| **Plausible** | Privacy-first marketing-page analytics |

### 🧯 Observability
| Service | Use it for |
|---|---|
| **Sentry** | Frontend + API error tracking |
| **Axiom** or **Logtail** | Structured logs from the render pipeline |

---

## Minimum viable API set (to actually ship a working product)

If you only sign up for these, you can ship:

1. **NextAuth** + **Google OAuth** — login
2. **Supabase** (Postgres + Auth + Storage in one) — DB + file store
3. **Anthropic Claude** — scripts
4. **Replicate** (Flux Schnell) — images
5. **ElevenLabs** — voice
6. **Pixabay Music API** — royalty-free music
7. **Remotion Lambda** *(or Shotstack)* — render
8. **Inngest** — cron + pipeline orchestration
9. **TikTok / Instagram / YouTube** posting APIs
10. **Stripe** — billing
11. **Resend** — email

Everything else is nice-to-have.

---

## Changing the brand

All branding is centralised:

- **Name + tagline + socials** — `src/lib/brand.ts`
- **Colour palette** — `tailwind.config.ts` (`brand`, `accent`, `bg`, `ink`, `line`)
- **Logo mark** — `src/components/marketing/Logo.tsx`
- **Niches / art styles / voices / pricing / FAQ / testimonials** — `src/lib/data.ts`

The code does not hardcode strings outside these files.

---

## License

This is a re-branded clone built for educational reference. Ship something that
respects the originals' trademarks and the platform terms of service of TikTok,
Instagram and YouTube.
