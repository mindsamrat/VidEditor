import Link from "next/link";
import { Logo } from "@/components/marketing/Logo";
import { authEnabled, signIn } from "@/auth";
import { redirect } from "next/navigation";

export const metadata = { title: "Create account — ReelForge" };

export default function SignupPage() {
  async function googleSignIn() {
    "use server";
    if (!authEnabled) redirect("/studio");
    await signIn("google", { redirectTo: "/studio" });
  }

  return (
    <main className="min-h-screen grid md:grid-cols-2">
      <div className="px-6 py-10 flex flex-col">
        <Logo />
        <div className="my-auto max-w-sm w-full mx-auto">
          <h1 className="font-display text-3xl font-bold">Spin up your faceless channel.</h1>
          <p className="mt-2 text-ink-dim text-sm">
            Free during open beta. Bring your own AI keys.
          </p>
          <form action={googleSignIn} className="mt-8 space-y-3">
            <button type="submit" className="w-full btn-brand justify-center">
              <span className="w-4 h-4 rounded-sm bg-white" /> Continue with Google
            </button>
          </form>
          {!authEnabled && (
            <p className="mt-4 text-xs text-ink-mute">
              Accounts aren&rsquo;t configured yet — this takes you straight to the studio.
            </p>
          )}
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
              <li>✓ Generate the script or paste your own</li>
              <li>✓ 9:16 visuals via OpenAI gpt-image-1</li>
              <li>✓ Voiceover via OpenAI TTS (cheapest)</li>
              <li>✓ Final MP4 composed in your browser</li>
              <li>✓ Library + downloads (when DB is on)</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
