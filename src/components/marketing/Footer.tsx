import Link from "next/link";
import { Logo } from "./Logo";
import { BRAND } from "@/lib/brand";

export function Footer() {
  return (
    <footer className="border-t border-line mt-24">
      <div className="max-w-6xl mx-auto px-5 py-14 grid grid-cols-2 md:grid-cols-5 gap-10">
        <div className="col-span-2">
          <Logo />
          <p className="mt-3 text-sm text-ink-dim max-w-xs">
            {BRAND.pitch}
          </p>
          <div className="mt-5 flex gap-3 text-ink-dim">
            <Link href={BRAND.social.tiktok} aria-label="TikTok" className="hover:text-ink">TikTok</Link>
            <span className="text-line">·</span>
            <Link href={BRAND.social.instagram} aria-label="Instagram" className="hover:text-ink">Instagram</Link>
            <span className="text-line">·</span>
            <Link href={BRAND.social.youtube} aria-label="YouTube" className="hover:text-ink">YouTube</Link>
            <span className="text-line">·</span>
            <Link href={BRAND.social.twitter} aria-label="X" className="hover:text-ink">X</Link>
          </div>
        </div>
        <FooterCol title="Product">
          <FLink href="/#how">How it works</FLink>
          <FLink href="/#features">Features</FLink>
          <FLink href="/#niches">Niches</FLink>
          <FLink href="/pricing">Pricing</FLink>
          <FLink href="/faq">FAQ</FLink>
        </FooterCol>
        <FooterCol title="Company">
          <FLink href="/affiliate">Affiliate</FLink>
          <FLink href={`mailto:${BRAND.contact}`}>Contact</FLink>
          <FLink href="/terms">Terms</FLink>
          <FLink href="/privacy">Privacy</FLink>
        </FooterCol>
        <FooterCol title="Get started">
          <FLink href="/signup">Create account</FLink>
          <FLink href="/login">Log in</FLink>
          <FLink href="/dashboard">Dashboard</FLink>
        </FooterCol>
      </div>
      <div className="border-t border-line">
        <div className="max-w-6xl mx-auto px-5 py-5 text-xs text-ink-mute flex flex-col md:flex-row justify-between gap-2">
          <p>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</p>
          <p>Made for creators who&rsquo;d rather not be on camera.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs uppercase tracking-widest text-ink-mute mb-3">{title}</h4>
      <ul className="space-y-2 text-sm">{children}</ul>
    </div>
  );
}
function FLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-ink-dim hover:text-ink">
        {children}
      </Link>
    </li>
  );
}
