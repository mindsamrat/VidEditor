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
  let user = null;
  if (authEnabled) {
    try {
      const session = await auth();
      user = session?.user || null;
    } catch {
      user = null;
    }
  }
  return <NavbarClient nav={NAV} user={user} authEnabled={authEnabled} />;
}
