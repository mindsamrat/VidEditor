import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { Pricing } from "@/components/marketing/Pricing";
import { FAQ } from "@/components/marketing/FAQ";
import { CTA } from "@/components/marketing/CTA";

export const metadata = {
  title: "Pricing — ReelForge",
  description: "Free during open beta. Bring your own AI keys.",
};

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main>
        <div className="pt-12">
          <Pricing />
        </div>
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
