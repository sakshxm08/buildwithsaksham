"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import {
  BsCheckLg,
  BsCopy,
  BsGithub,
  BsInstagram,
  BsLinkedin,
} from "react-icons/bs";
import { MdEmail, MdOpenInNew } from "react-icons/md";
import { useInView } from "react-intersection-observer";
import MotionWrapper from "@/components/motion-wrapper";
import SectionHeader from "@/components/section-header";
import { CONFIG } from "@/config";
import { ASSETS } from "@/constant/assets";

const AnimatedImage = motion(Image);

export default function LetsConnectSection() {
  const [copied, setCopied] = useState(false);
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONFIG.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const socialLinks = [
    {
      name: "LinkedIn",
      href: CONFIG.socials.linkedin,
      icon: <BsLinkedin className="text-xl text-[#0A66C2]" />,
      handle: "/in/sakshxm08",
      color: "hover:border-[#0A66C2]/40",
      image: ASSETS.home.letsConnect.linkedin,
    },
    {
      name: "GitHub",
      href: CONFIG.socials.github,
      icon: <BsGithub className="text-xl text-neutral-900" />,
      handle: "@sakshxm08",
      color: "hover:border-neutral-800/40",
      image: ASSETS.home.letsConnect.github,
    },
    {
      name: "Instagram",
      href: CONFIG.socials.instagram,
      icon: <BsInstagram className="text-xl text-[#E4405F]" />,
      handle: "@sakshxm08",
      color: "hover:border-[#E4405F]/40",
      image: ASSETS.home.letsConnect.instagram,
    },
  ];

  return (
    <section
      id="contact"
      ref={ref}
      className="dk-safe-x-padding dk-section-distance scroll-mt-24"
      aria-label="Let's Connect Section"
    >
      <SectionHeader
        title="Let's Connect"
        description="Whether you have an interesting project, engineering inquiry, or want to collaborate — feel free to reach out."
        inViewport={inView}
        className="text-center"
        animate
      />

      <div className="mt-14 max-w-5xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Avatar + Floating 3D elements */}
        <div className="relative flex items-center justify-center shrink-0">
          <MotionWrapper
            initial={{ scale: 0.9, opacity: 0 }}
            animate={inView ? { scale: 1, opacity: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="relative size-60 sm:size-72 md:size-80 lg:size-96 rounded-full bg-linear-to-tr from-primary/10 via-secondary/10 to-transparent p-4 flex items-center justify-center border border-gray-100 shadow-xl"
          >
            <AnimatedImage
              initial={{ y: 20, opacity: 0 }}
              animate={inView ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="size-full object-contain"
              src={ASSETS.home.letsConnect.avatarBigSmile}
              alt="Saksham Smiling Avatar"
              width={384}
              height={384}
              priority
            />
          </MotionWrapper>
        </div>

        {/* Contact Methods Cards */}
        <div className="flex-1 w-full space-y-4">
          {/* Email Quick Action Card */}
          <MotionWrapper
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl">
                  <MdEmail />
                </div>
                <div>
                  <p className="text-xs font-semibold text-accent2">
                    Email directly
                  </p>
                  <p className="font-montserrat font-bold text-base md:text-lg text-neutral-900 select-all">
                    {CONFIG.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={copyEmail}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gray text-neutral-700 hover:bg-neutral-800 hover:text-white transition-all cursor-pointer"
                >
                  {copied ? (
                    <BsCheckLg className="text-emerald-500" />
                  ) : (
                    <BsCopy />
                  )}
                  <span>{copied ? "Copied!" : "Copy"}</span>
                </button>
                <a
                  href={`mailto:${CONFIG.email}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white dk-gradient-btn shadow-sm hover:shadow-md transition-all"
                >
                  <span>Open Mail</span>
                  <MdOpenInNew />
                </a>
              </div>
            </div>
          </MotionWrapper>

          {/* Social Profiles Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {socialLinks.map((social, index) => (
              <MotionWrapper
                key={social.name}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                whileHover={{ y: -3 }}
                className={`p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all ${social.color}`}
              >
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3"
                  aria-label={`${social.name} profile`}
                >
                  <div className="size-10 rounded-xl bg-gray flex items-center justify-center shrink-0">
                    {social.icon}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold text-xs text-neutral-900">
                      {social.name}
                    </p>
                    <p className="text-xs text-accent2 truncate">
                      {social.handle}
                    </p>
                  </div>
                </a>
              </MotionWrapper>
            ))}
          </div>

          {/* Terminal Command Reminder */}
          <MotionWrapper
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="p-4 rounded-2xl bg-neutral-900 text-neutral-300 font-mono text-xs flex items-center justify-between gap-3 shadow-lg"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-emerald-400 font-bold shrink-0">❯</span>
              <span className="text-neutral-400">Terminal business card:</span>
              <span className="text-white font-bold truncate">
                npx buildwithsaksham
              </span>
            </div>
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText("npx buildwithsaksham");
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs shrink-0 cursor-pointer transition-colors"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </MotionWrapper>
        </div>
      </div>
    </section>
  );
}
