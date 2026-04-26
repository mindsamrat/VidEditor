import Link from "next/link";
import { BRAND } from "@/lib/brand";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`group inline-flex items-center gap-2 ${className}`}>
      <span className="relative grid place-items-center w-8 h-8 rounded-lg bg-brand text-bg shadow-glow">
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 4v16l14-8z" />
        </svg>
      </span>
      <span className="font-display font-bold text-lg tracking-tight">
        {BRAND.name}
      </span>
    </Link>
  );
}
