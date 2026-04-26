import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { FAQ } from "@/components/marketing/FAQ";
import { CTA } from "@/components/marketing/CTA";

export const metadata = { title: "FAQ — ReelForge" };

export default function FAQPage() {
  return (
    <>
      <Navbar />
      <main className="pt-12">
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
