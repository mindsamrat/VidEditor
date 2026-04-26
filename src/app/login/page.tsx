import Link from "next/link";
import { Logo } from "@/components/marketing/Logo";

export const metadata = { title: "Log in — ReelForge" };

export default function LoginPage() {
  return (
    <main className="min-h-screen grid md:grid-cols-2">
      <div className="px-6 py-10 flex flex-col">
        <Logo />
        <div className="my-auto max-w-sm w-full mx-auto">
          <h1 className="font-display text-3xl font-bold">Welcome back.</h1>
          <p className="mt-2 text-ink-dim text-sm">
            Sign in to keep your faceless channels posting.
          </p>
          <form action="/dashboard" className="mt-8 space-y-3">
            <button
              type="button"
              className="w-full btn-ghost justify-center"
            >
              <span className="w-4 h-4 rounded-sm bg-white" /> Continue with Google
            </button>
            <div className="flex items-center gap-3 my-4">
              <div className="h-px flex-1 bg-line" />
              <span className="text-xs text-ink-mute">or with email</span>
              <div className="h-px flex-1 bg-line" />
            </div>
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
              placeholder="Password"
              className="w-full bg-bg-elev border border-line rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand"
            />
            <button type="submit" className="w-full btn-brand justify-center">
              Log in
            </button>
          </form>
          <p className="mt-6 text-sm text-ink-dim text-center">
            New here?{" "}
            <Link href="/signup" className="text-brand hover:underline">
              Create an account
            </Link>
          </p>
        </div>
        <p className="text-xs text-ink-mute">
          By continuing you agree to our{" "}
          <Link href="/terms" className="underline">Terms</Link> and{" "}
          <Link href="/privacy" className="underline">Privacy Policy</Link>.
        </p>
      </div>
      <div className="hidden md:block relative overflow-hidden border-l border-line">
        <div className="absolute inset-0 bg-radial-brand" />
        <div className="absolute inset-0 bg-grid-faint [background-size:42px_42px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
        <div className="relative h-full grid place-items-center p-10">
          <div className="card p-6 max-w-sm w-full">
            <div className="text-xs font-mono text-brand">▶ live status</div>
            <p className="mt-2 font-display text-xl">
              ReelForge has shipped <span className="text-brand">1,284</span> faceless
              videos in the last 24h.
            </p>
            <ul className="mt-5 space-y-3 text-sm text-ink-dim">
              <li>• 412 to TikTok</li>
              <li>• 521 to Instagram Reels</li>
              <li>• 351 to YouTube Shorts</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
