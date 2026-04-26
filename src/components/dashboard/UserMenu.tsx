import Link from "next/link";
import { auth, authEnabled, signOut } from "@/auth";

export async function UserMenu() {
  const session = authEnabled ? await auth().catch(() => null) : null;
  const user = session?.user;

  async function doSignOut() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  if (!user) {
    if (!authEnabled) {
      // Anonymous mode — show a small badge instead of a sign-in link.
      return (
        <span className="text-[10px] uppercase tracking-widest bg-brand/10 text-brand px-2 py-1 rounded-full">
          Anon · Beta
        </span>
      );
    }
    return (
      <Link href="/login" className="text-xs text-ink-dim hover:text-ink px-2">
        Sign in
      </Link>
    );
  }

  const initial = (user.name || user.email || "?").trim().charAt(0).toUpperCase();
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-9 h-9 rounded-full bg-gradient-to-br from-brand to-accent grid place-items-center text-bg font-bold text-sm overflow-hidden"
        title={user.name || user.email || "Account"}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {user.image ? <img src={user.image} alt="" className="w-full h-full object-cover" /> : initial}
      </div>
      <form action={doSignOut}>
        <button type="submit" className="text-xs text-ink-dim hover:text-ink px-2">
          Sign out
        </button>
      </form>
    </div>
  );
}
