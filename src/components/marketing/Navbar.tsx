import Link from "next/link";
import { auth, authEnabled } from "@/auth";
import { NavbarClient } from "./NavbarClient";

const NAV = [
  { href: "/#how", label: "How it works" },
  { href: "/#niches", label: "Niches" },
  { href: "/#features", label: "Features" },
  { href: "/studio", label: "Studio" },
  { href: "/pricing", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
];

export async function Navbar() {
  const session = authEnabled ? await auth().catch(() => null) : null;
  return <NavbarClient nav={NAV} user={session?.user || null} authEnabled={authEnabled} />;
}

// Re-export the NAV link type so the marketing/Footer can stay simple.
export type NavLink = (typeof NAV)[number];

// Shim so existing imports `import { Navbar } from ...` continue to work.
export default Navbar;

// (Link import retained so this server file can compose the NavbarClient.)
export { Link };
