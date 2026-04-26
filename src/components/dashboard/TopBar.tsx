import Link from "next/link";
import { UserMenu } from "./UserMenu";

export function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="h-16 border-b border-line px-6 flex items-center justify-between gap-4">
      <div>
        <h1 className="font-display text-lg font-semibold leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-ink-mute">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        <Link href="/studio" className="hidden sm:inline-flex btn-ghost text-xs py-2 px-3">
          Open studio
        </Link>
        <Link href="/dashboard/create" className="btn-brand text-sm py-2 px-3">
          + New series
        </Link>
        <UserMenu />
      </div>
    </header>
  );
}
