import { CONFIG } from "@/config";
import Footer from "../components/footer";
import ExperienceSection from "./_components/experience-section";
import HeroSection from "./_components/hero-section";
import LetsConnectSection from "./_components/lets-connect-section";
import MyLatestProjectSection from "./_components/my-latest-project-section";
import QuoteSection from "./_components/quote-section";
import TechStackSection from "./_components/tech-stack-section";

export const metadata = {
  title: `${CONFIG.name.first} ${CONFIG.name.last} — ${CONFIG.role}`,
  description: `${CONFIG.quotes.text} Explore full-stack projects, experience, technical stack, and engineering background.`,
};

export const dynamic = "force-static";

export default function Home() {
  return (
    <div className="dk-safe-layout">
      <HeroSection />
      <TechStackSection />
      <ExperienceSection />
      <MyLatestProjectSection />
      <LetsConnectSection />
      <QuoteSection />
      <Footer />
    </div>
  );
}
