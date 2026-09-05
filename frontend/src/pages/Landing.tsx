import { LandingNav } from "../components/landing/LandingNav";
import { Hero } from "../components/landing/Hero";
import { Story } from "../components/landing/Story";
import { CorridorBand } from "../components/landing/CorridorBand";
import { Features } from "../components/landing/Features";
import { DashboardPreview } from "../components/landing/DashboardPreview";
import { Footer } from "../components/landing/Footer";

export default function Landing() {
  return (
    <>
      <LandingNav />
      <main>
        <Hero />
        <Story />
        <CorridorBand />
        <Features />
        <DashboardPreview />
      </main>
      <Footer />
    </>
  );
}
