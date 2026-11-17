import { Hero } from "@/components/sections/Hero";
import { MethodStrip } from "@/components/sections/MethodStrip";
import { MarkSection } from "@/components/sections/MarkSection";
import { Manifesto } from "@/components/sections/Manifesto";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { FeatureShowcase } from "@/components/sections/FeatureShowcase";
import { WhyPhronem } from "@/components/sections/WhyPhronem";
import { Audiences } from "@/components/sections/Audiences";
import { ExpertsBand } from "@/components/sections/ExpertsBand";
import { Standards } from "@/components/sections/Standards";
import { ClosingRoutes } from "@/components/sections/ClosingRoutes";

/**
 * Homepage, in the information order every expert network uses (docs/information-architecture.md),
 * with the reference template's motion moments (emblem, pinned statement) kept after the hero:
 * hero → method strip (in place of stats) → emblem → statement → services → how an engagement
 * works → what an engagement delivers (four-feature showcase) → why Phronem → clients we support →
 * for experts → compliance → closing call to action routed by audience.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <MethodStrip />
      <MarkSection />
      <Manifesto />
      <ServicesSection />
      <HowItWorks />
      <FeatureShowcase />
      <WhyPhronem />
      <Audiences />
      <ExpertsBand />
      <Standards />
      <ClosingRoutes />
    </>
  );
}
