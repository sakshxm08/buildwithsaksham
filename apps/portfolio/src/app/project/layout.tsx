import type { ReactNode } from "react";
import Footer from "@/components/footer";

export const dynamic = "force-static";

export default function ProjectLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}
