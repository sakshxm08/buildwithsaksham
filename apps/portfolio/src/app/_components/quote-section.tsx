"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
import { useInView } from "react-intersection-observer";
import MotionWrapper from "@/components/motion-wrapper";
import { CONFIG } from "@/config";
import { ASSETS } from "@/constant/assets";
import { FONT_SUARTE } from "@/constant/font";

const AnimatedImage = motion(Image);

const QuoteSection = () => {
  const ref = useRef<HTMLElement | null>(null);
  const [refCallback, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const FloatingImage = ({
    item,
  }: {
    item: (typeof animatedFloatingImages)[0];
    inView: boolean;
  }) => {
    return (
      <AnimatedImage
        className={item.className}
        src={item.src}
        width={item.width}
        height={item.height}
        initial={item.initial}
        animate={inView ? { x: 0, y: [0, -6, 0], opacity: 1 } : {}}
        transition={{
          delay: item.delay,
          y: { duration: 3.5, repeat: Infinity, delay: item.delay },
        }}
        alt=""
        aria-hidden="true"
      />
    );
  };

  const animatedFloatingImages = [
    {
      className:
        "hidden sm:block absolute -z-10 -top-16 left-6 md:left-24 lg:left-36 w-[60px] h-[60px] lg:w-[90px] lg:h-[90px]",
      src: ASSETS.decoratives.teaCup,
      width: 90,
      height: 90,
      initial: { opacity: 0 },
      delay: 0.2,
    },
    {
      className:
        "hidden sm:block absolute -z-10 -top-16 right-6 md:right-24 lg:right-36 w-[60px] h-[60px] lg:w-[90px] lg:h-[90px]",
      src: ASSETS.decoratives.bulb,
      width: 90,
      height: 90,
      initial: { opacity: 0 },
      delay: 0.4,
    },
    {
      className:
        "hidden sm:block absolute -z-10 -bottom-16 left-8 md:left-28 xl:left-52 w-[60px] h-[60px] lg:w-[90px] lg:h-[90px]",
      src: ASSETS.decoratives.paintKit,
      width: 90,
      height: 90,
      initial: { opacity: 0 },
      delay: 0.6,
    },
    {
      className:
        "hidden sm:block absolute -z-10 -bottom-16 right-8 md:right-28 xl:right-52 w-[60px] h-[60px] lg:w-[90px] lg:h-[90px]",
      src: ASSETS.decoratives.heart,
      width: 90,
      height: 90,
      initial: { opacity: 0 },
      delay: 0.8,
    },
  ];

  return (
    <section
      ref={(el) => {
        ref.current = el;
        refCallback(el);
      }}
      className="dk-safe-x-padding dk-section-distance overflow-hidden"
      aria-label="Quote Section"
    >
      <div className="relative max-w-4xl mx-auto py-8">
        <MotionWrapper
          as="p"
          initial={{ y: 50, opacity: 0 }}
          animate={inView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="font-medium text-lg md:text-2xl leading-relaxed lg:text-3xl text-accent text-center italic"
        >
          &ldquo;{CONFIG.quotes.text}&rdquo;
        </MotionWrapper>

        {animatedFloatingImages.map((item, index) => (
          <FloatingImage key={index.toString()} item={item} inView={inView} />
        ))}
      </div>
      <MotionWrapper
        as="p"
        initial={{ y: 50, opacity: 0 }}
        animate={inView ? { y: 0, opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="font-medium text-5xl lg:text-6xl text-accent text-center mt-3"
        style={FONT_SUARTE.style}
      >
        {CONFIG.quotes.author}
      </MotionWrapper>
    </section>
  );
};

export default QuoteSection;
