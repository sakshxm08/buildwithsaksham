import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import { CONFIG } from "@/config";
import { FONT_MONTSERRAT, FONT_POPPINS } from "@/constant/font";
import { env } from "@/env";

import "./globals.css";

export const dynamic = "force-static";

const fullName = `${CONFIG.name.first} ${CONFIG.name.last}`;
const siteDescription = `${fullName} — ${CONFIG.role} based in ${CONFIG.location}. Transforming ideas into high-performance, user-centric web experiences with modern architecture.`;

export const metadata: Metadata = {
  title: {
    default: `${fullName} — ${CONFIG.role}`,
    template: `%s | ${fullName}`,
  },
  description: siteDescription,
  openGraph: {
    title: `${fullName} — ${CONFIG.role}`,
    description: siteDescription,
    url: env.NEXT_PUBLIC_APP_URL,
    images: [
      {
        url: `${env.NEXT_PUBLIC_APP_URL}/og-image.webp`,
        width: 1200,
        height: 630,
        alt: `${fullName} Portfolio`,
      },
    ],
  },
  twitter: {
    title: `${fullName} — ${CONFIG.role}`,
    description: siteDescription,
    images: [`${env.NEXT_PUBLIC_APP_URL}/og-image.webp`],
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${FONT_MONTSERRAT.variable} ${FONT_POPPINS.variable} antialiased`}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
