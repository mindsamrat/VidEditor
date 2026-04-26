// Static demo data used across marketing + dashboard pages.
// In production these come from the DB / your AI pipeline.

export type Niche = {
  slug: string;
  title: string;
  emoji: string;
  blurb: string;
  sample: string;
};

export const NICHES: Niche[] = [
  { slug: "mythology", title: "Mythology Stories", emoji: "🐉", blurb: "Greek, Norse, Egyptian myths in 60 seconds.", sample: "How Thor lost his hammer" },
  { slug: "history", title: "Historical Events", emoji: "🏛️", blurb: "Bite-sized history viewers actually finish.", sample: "The fall of Constantinople" },
  { slug: "scary", title: "Scary Stories", emoji: "👻", blurb: "Reddit nosleep narrations with cinematic visuals.", sample: "I work the night shift at a morgue" },
  { slug: "motivation", title: "Motivation", emoji: "🔥", blurb: "Stoic, hustle and discipline clips.", sample: "Marcus Aurelius on adversity" },
  { slug: "facts", title: "Mind-Blowing Facts", emoji: "🤯", blurb: "Did-you-know hooks that crush retention.", sample: "Why your tongue has a fingerprint" },
  { slug: "luxury", title: "Luxury Lifestyle", emoji: "💎", blurb: "Aesthetic wealth + supercar B-roll.", sample: "5 habits of self-made billionaires" },
  { slug: "space", title: "Space & Cosmos", emoji: "🪐", blurb: "What if you fell into a black hole? content.", sample: "What's inside Jupiter" },
  { slug: "true-crime", title: "True Crime", emoji: "🕵️", blurb: "60-second cold cases and cracked cases.", sample: "The Zodiac killer's last letter" },
  { slug: "psychology", title: "Psychology", emoji: "🧠", blurb: "Dark psych, body language, persuasion.", sample: "The 7-second rule" },
  { slug: "ai-news", title: "AI News", emoji: "🤖", blurb: "Daily AI drops, summarised.", sample: "Anthropic just shipped..." },
  { slug: "fitness", title: "Fitness Tips", emoji: "🏋️", blurb: "Form fixes, science-backed routines.", sample: "Why your bench is stuck" },
  { slug: "finance", title: "Finance & Wealth", emoji: "📈", blurb: "Money habits, tax loopholes, investing 101.", sample: "Roth vs traditional in 30s" },
];

export type ArtStyle = {
  id: string;
  label: string;
  hint: string;
};

export const ART_STYLES: ArtStyle[] = [
  { id: "cinematic", label: "Cinematic Realism", hint: "Photoreal, shallow depth, film grain" },
  { id: "anime", label: "Anime", hint: "Studio-style cel shading" },
  { id: "3d-pixar", label: "3D Animated", hint: "Stylised CGI, soft lighting" },
  { id: "comic", label: "Comic / Graphic Novel", hint: "Inked, halftone, bold colour" },
  { id: "watercolor", label: "Watercolor", hint: "Soft washes, paper texture" },
  { id: "old-camera", label: "Old Camera", hint: "VHS / 35mm vintage" },
  { id: "lowpoly", label: "Low Poly", hint: "Geometric, faceted" },
  { id: "psychedelic", label: "Psychedelic", hint: "Vibrant, surreal palettes" },
  { id: "pop-art", label: "Pop Art", hint: "Bold, screen-printed" },
  { id: "noir", label: "Film Noir", hint: "High contrast, B&W" },
];

export type Voice = {
  id: string;
  name: string;
  gender: "male" | "female";
  vibe: string;
};

export const VOICES: Voice[] = [
  { id: "atlas", name: "Atlas", gender: "male", vibe: "Deep, narrative, documentary" },
  { id: "rune", name: "Rune", gender: "male", vibe: "Gritty, true-crime" },
  { id: "kai", name: "Kai", gender: "male", vibe: "Young, energetic, hype" },
  { id: "nova", name: "Nova", gender: "female", vibe: "Warm, storyteller" },
  { id: "iris", name: "Iris", gender: "female", vibe: "Crisp, news-anchor" },
  { id: "sable", name: "Sable", gender: "female", vibe: "Sultry, ASMR-adjacent" },
];

export type Plan = {
  id: "starter" | "creator" | "scale";
  name: string;
  price: number;
  yearlyPrice: number;
  blurb: string;
  videos: string;
  series: string;
  highlights: string[];
  highlight?: boolean;
  cta: string;
};

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 19,
    yearlyPrice: 15,
    blurb: "Test the waters with one auto-posting series.",
    videos: "30 videos / month",
    series: "1 active series",
    highlights: [
      "1 connected social account",
      "6 AI voices",
      "All 10 art styles",
      "Auto-post to TikTok, IG or YT",
      "720p export",
    ],
    cta: "Start with Starter",
  },
  {
    id: "creator",
    name: "Creator",
    price: 39,
    yearlyPrice: 31,
    blurb: "For creators running multiple faceless channels.",
    videos: "120 videos / month",
    series: "5 active series",
    highlights: [
      "Up to 5 social accounts",
      "Custom music + TikTok sound links",
      "Captions / subtitle styles",
      "Schedule + queue calendar",
      "1080p export",
      "Priority generation queue",
    ],
    highlight: true,
    cta: "Start with Creator",
  },
  {
    id: "scale",
    name: "Scale",
    price: 69,
    yearlyPrice: 55,
    blurb: "For agencies and full-time faceless operators.",
    videos: "400 videos / month",
    series: "Unlimited series",
    highlights: [
      "Unlimited social accounts",
      "Voice cloning (1 custom voice)",
      "Brand kits + logo overlay",
      "Team seats (3 included)",
      "API access",
      "1080p + 4K export",
    ],
    cta: "Go to Scale",
  },
];

export const FEATURES = [
  {
    icon: "🎬",
    title: "AI scripts that hook in 3s",
    body: "Hook → payoff scripts written for the algorithm, tuned to your niche and voice.",
  },
  {
    icon: "🖼️",
    title: "Visuals in your style",
    body: "10+ art styles from cinematic realism to anime — consistent across every clip in a series.",
  },
  {
    icon: "🎙️",
    title: "Studio-grade AI voices",
    body: "6 narrator voices out of the box. Pro plans unlock voice cloning.",
  },
  {
    icon: "🎵",
    title: "Music your way",
    body: "Royalty-free library, your own uploads, or paste a TikTok sound link.",
  },
  {
    icon: "📝",
    title: "Animated captions",
    body: "Word-by-word, viral-style captions burned into every video.",
  },
  {
    icon: "📆",
    title: "Set & forget scheduling",
    body: "Daily, weekly or custom cadence — we publish for you, even on vacation.",
  },
  {
    icon: "🔗",
    title: "Native auto-posting",
    body: "Direct API integrations with TikTok, Instagram Reels and YouTube Shorts.",
  },
  {
    icon: "📊",
    title: "Performance feedback loop",
    body: "We watch which hooks pop and double down on what's working.",
  },
  {
    icon: "🪄",
    title: "Edit before publish (optional)",
    body: "Approve, tweak captions, swap a clip — or fully automate it.",
  },
];

export const STEPS = [
  {
    n: "01",
    title: "Pick a niche",
    body: "Choose from 50+ proven faceless niches or describe your own theme.",
  },
  {
    n: "02",
    title: "Set your style",
    body: "Pick art style, voice, music and posting schedule. Takes about 90 seconds.",
  },
  {
    n: "03",
    title: "Connect socials",
    body: "Link TikTok, Instagram and YouTube once. We do the rest.",
  },
  {
    n: "04",
    title: "We ship videos forever",
    body: "Scripts, visuals, voiceover, captions, render, schedule and post — on autopilot.",
  },
];

export const TESTIMONIALS = [
  {
    name: "Maya R.",
    handle: "@mythbites",
    body: "I set up a mythology series on a Tuesday. By Sunday I had 14k followers I never had to film for.",
    stat: "+14,200 followers in 5 days",
  },
  {
    name: "Daniel O.",
    handle: "@coldcaseclips",
    body: "I run 4 true-crime channels off ReelForge. The series model means I literally never open the app some weeks.",
    stat: "4 channels · 1 person",
  },
  {
    name: "Priya K.",
    handle: "@stoicdaily",
    body: "The hooks are scary good. My retention curve looks like a creator with a team of 5.",
    stat: "82% avg retention",
  },
  {
    name: "Marcus L.",
    handle: "@spacefacts",
    body: "Posted 90 days straight without ever opening TikTok. First viral hit pulled 2.1M views.",
    stat: "2.1M on a single Short",
  },
  {
    name: "Sofía B.",
    handle: "@motivacasti",
    body: "Spanish-language motivation niche, zero competitors using AI like this. ReelForge prints.",
    stat: "$3.4k/mo creator fund",
  },
  {
    name: "Theo H.",
    handle: "@aidailybrief",
    body: "I tell it the news angle, it ships 3 videos that day. Replaced a 2-person team.",
    stat: "Replaced a 2-person team",
  },
];

export const FAQS = [
  {
    q: "What is ReelForge actually doing for me?",
    a: "You pick a niche and a style. Our AI writes a script, generates visuals in that style, voices it with an AI narrator, adds music and burned-in captions, renders an MP4, and pushes it to your TikTok / Instagram Reels / YouTube Shorts on the schedule you set. Forever.",
  },
  {
    q: "Do I need to show my face?",
    a: "No. That's the whole point. Every video is generated visuals + AI voiceover. You never appear.",
  },
  {
    q: "Can I edit a video before it posts?",
    a: "Yes. You can run in fully-auto mode, or set the queue to 'review before post' so you approve every video in one tap.",
  },
  {
    q: "Which platforms can ReelForge post to?",
    a: "TikTok, Instagram Reels and YouTube Shorts. We use each platform's official posting API, so there's no shady scraping or browser automation.",
  },
  {
    q: "Can I use my own music or a TikTok sound?",
    a: "Both. Upload an MP3, pick from our royalty-free library, or paste a TikTok sound link and we'll use it as the audio bed.",
  },
  {
    q: "What if my videos get flagged or copyright-claimed?",
    a: "All visuals are AI-generated and music is royalty-free or sourced from your own uploads. If you paste a TikTok sound link, that risk is on the platform's terms — same as posting natively.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. All plans are month-to-month. Cancel from the billing tab and you keep access until the end of your period.",
  },
  {
    q: "Do you offer a free trial?",
    a: "We offer a 7-day money-back guarantee on the Starter and Creator plans — try it, and if it's not for you we refund you, no questions.",
  },
  {
    q: "Can I run multiple channels?",
    a: "Yes. The Creator plan supports 5 active series and 5 social accounts. Scale is unlimited.",
  },
];

export const SHOWCASE = [
  { niche: "Mythology", style: "Cinematic", views: "1.4M", title: "How Thor lost his hammer" },
  { niche: "Scary Stories", style: "Cinematic", views: "812K", title: "I work the morgue night shift" },
  { niche: "Space", style: "3D Animated", views: "2.1M", title: "What's inside Jupiter" },
  { niche: "Motivation", style: "Old Camera", views: "640K", title: "Marcus Aurelius on pain" },
  { niche: "True Crime", style: "Noir", views: "980K", title: "The Zodiac's last letter" },
  { niche: "Facts", style: "Pop Art", views: "1.1M", title: "Your tongue has a fingerprint" },
];

export const LOGOS = [
  "TIKTOK",
  "INSTAGRAM",
  "YOUTUBE",
  "META",
  "REDDIT",
  "PRODUCT HUNT",
  "ELEVENLABS",
  "ANTHROPIC",
];
