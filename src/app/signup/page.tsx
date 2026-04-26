import Link from "next/link";
import { Logo } from "@/components/marketing/Logo";

export const metadata = { title: "Create account — ReelForge" };

export default function SignupPage() {
  return (
    <main className="min-h-screen grid md:grid-cols-2">
      <div className="px-6 py-10 flex flex-col">
        <Logo />
        <div className="my-auto max-w-sm w-full mx-auto">
          <h1 className="font-display text-3xl font-bold">Spin up your faceless channel.</h1>
          <p className="mt-2 text-ink-dim text-sm">
            5 minutes to first auto-posted reel. 7-day money-back.
          </p>
          <form action="/dashboard/create" className="mt-8 space-y-3">
            <button type="button" className="w-full btn-ghost justify-center">
              <span className="w-4 h-4 rounded-sm bg-white" /> Continue with Google
            </button>
            <div className="flex items-center gap-3 my-4">
              <div className="h-px flex-1 bg-line" />
              <span className="text-xs text-ink-mute">or with email</span>
              <div className="h-px flex-1 bg-line" />
            </div>
            <input
              name="name"
              required
              placeholder="Your name"
              className="w-full bg-bg-elev border border-line rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand"
            />
            <input
              name="email"
              type="email"
              required
              placeholder="you@channel.com"
              className="w-full bg-bg-elev border border-line rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand"
            />
            <input
              name="password"
              type="password"
              required
              placeholder="Pick a password"
              className="w-full bg-bg-elev border border-line rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand"
            />
            <button type="submit" className="w-full btn-brand justify-center">
              Create account
            </button>
          </form>
          <p className="mt-6 text-sm text-ink-dim text-center">
            Already have one?{" "}
            <Link href="/login" className="text-brand hover:underline">
              Log in
            </Link>
          </p>
        </div>
        <p className="text-xs text-ink-mute">
          By creating an account you agree to our{" "}
          <Link href="/terms" className="underline">Terms</Link> and{" "}
          <Link href="/privacy" className="underline">Privacy Policy</Link>.
        </p>
      </div>
      <div className="hidden md:block relative overflow-hidden border-l border-line">
        <div className="absolute inset-0 bg-radial-brand" />
        <div className="relative h-full grid place-items-center p-10">
          <div className="card p-6 max-w-sm w-full">
            <h2 className="font-display text-lg">What you get out of the box</h2>
            <ul className="mt-4 space-y-3 text-sm text-ink-dim">
              <li>✓ AI scripts tuned for hook-retention curves</li>
              <li>✓ 10 art styles, 6 voices, royalty-free music</li>
              <li>✓ Native posting to TikTok / IG / YT</li>
              <li>✓ Series engine — set it once, ship forever</li>
              <li>✓ Cancel any time</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
