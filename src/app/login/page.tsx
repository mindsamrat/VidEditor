import Link from "next/link";
import { Logo } from "@/components/marketing/Logo";
import { authEnabled, signIn } from "@/auth";
import { redirect } from "next/navigation";

export const metadata = { title: "Log in — ReelForge" };

export default function LoginPage() {
  async function googleSignIn() {
    "use server";
    if (!authEnabled) redirect("/dashboard");
    await signIn("google", { redirectTo: "/dashboard" });
  }

  return (
    <main className="min-h-screen grid md:grid-cols-2">
      <div className="px-6 py-10 flex flex-col">
        <Logo />
        <div className="my-auto max-w-sm w-full mx-auto">
          <h1 className="font-display text-3xl font-bold">Welcome back.</h1>
          <p className="mt-2 text-ink-dim text-sm">
            Sign in to keep your library in sync.
          </p>
          <form action={googleSignIn} className="mt-8 space-y-3">
            <button
              type="submit"
              className="w-full btn-brand justify-center"
            >
              <span className="w-4 h-4 rounded-sm bg-white" /> Continue with Google
            </button>
          </form>
          {!authEnabled && (
            <p className="mt-4 text-xs text-ink-mute">
              Accounts aren&rsquo;t configured yet. The button takes you straight to the dashboard.
              Set <code className="font-mono">AUTH_SECRET</code>, <code className="font-mono">GOOGLE_CLIENT_ID</code>,{" "}
              <code className="font-mono">GOOGLE_CLIENT_SECRET</code> and <code className="font-mono">DATABASE_URL</code> in Vercel to enable accounts.
            </p>
          )}
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
            <div className="text-xs font-mono text-brand">▶ live</div>
            <p className="mt-2 font-display text-xl">
              Open the studio. Bring your own AI keys. Compose reels in your browser.
            </p>
            <ul className="mt-5 space-y-3 text-sm text-ink-dim">
              <li>• Claude writes the script</li>
              <li>• OpenAI generates 9:16 visuals</li>
              <li>• OpenAI TTS voices it</li>
              <li>• Browser renders the MP4</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
