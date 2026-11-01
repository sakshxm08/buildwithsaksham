import type { Metadata } from "next";
import SectionHeader from "@/components/section-header";
import { CONFIG } from "@/config";
import ProjectExplorer from "./_components/project-explorer";

export const metadata: Metadata = {
  title: `Projects — ${CONFIG.name.first} ${CONFIG.name.last}`,
  description: `Explore production web applications, AI platforms, and developer tools built by ${CONFIG.name.first} ${CONFIG.name.last}.`,
};

export const dynamic = "force-static";

export default function ProjectPage() {
  return (
    <main className="dk-safe-layout pt-16 pb-24 min-h-screen">
      <div className="dk-safe-x-padding">
        <SectionHeader
          title="All Projects"
          description="A complete directory of full-stack platforms, open-source utilities, and AI applications I've created."
          className="text-center"
        />
        <ProjectExplorer />
      </div>
    </main>
  );
}
