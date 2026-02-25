import { NavBar } from "@/components/landing/NavBar";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { FeatureGridSection } from "@/components/landing/FeatureGridSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { ProductPreviewSection } from "@/components/landing/ProductPreviewSection";
import { CtaSection } from "@/components/landing/CtaSection";
import { PilotSection } from "@/components/landing/PilotSection";
import { ContactSection } from "@/components/landing/ContactSection";

export default function HomePage() {
  return (
    <div className="min-h-screen relative flex flex-col selection:bg-blue-200 selection:text-blue-900">
      <NavBar />
      <main className="flex-1 flex flex-col">
        <HeroSection />
        <ProblemSection />
        <FeatureGridSection />
        <HowItWorksSection />
        <ProductPreviewSection />
        <CtaSection />
        <PilotSection />
      </main>
      <ContactSection />
    </div>
  );
}
