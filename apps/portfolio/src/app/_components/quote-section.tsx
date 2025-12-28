"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
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

  const { scrollYProgress } = useScroll({ target: ref });

  const FloatingImage = ({
    item,
    inView,
    scrollYProgress,
  }: {
    item: (typeof animatedFloatingImages)[0];
    inView: boolean;
    scrollYProgress: any;
  }) => {
    const [phase, setPhase] = useState<"entrance" | "floating">("entrance");

    useEffect(() => {
      if (inView) {
        const timer = setTimeout(
          () => setPhase("floating"),
          (item.delay + 0.5) * 1000
        );
        return () => clearTimeout(timer);
      }
    }, [inView, item.delay]);

    const opacity = useTransform(scrollYProgress, [0, 0.2], [0.15, 1]);

    const variants = {
      initial: item.initial,
      entrance: { y: 0, x: 0 },
      floating: {
        y: [0, -5, 0],
        transition: { duration: 2, repeat: Infinity },
        opacity: 1,
      },
    };

    return (
      <motion.div style={{ opacity }}>
        <AnimatedImage
          className={item.className}
          src={item.src}
          width={item.width}
          height={item.height}
          initial="initial"
          animate={phase}
          variants={variants}
          transition={
            phase === "entrance" ? { duration: 0.5, delay: item.delay } : {}
          }
          alt=""
        />
      </motion.div>
    );
  };

  const animatedFloatingImages = [
    {
      className:
        "absolute -z-10 -top-20 left-10 md:left-36 lg:left-48 lg:-top-24 w-[70px] h-[70px] lg:w-[100px] lg:h-[100px]",
      src: ASSETS.decoratives.teaCup,
      width: 100,
      height: 100,
      initial: { opacity: 0 },
      delay: 0.2,
    },
    {
      className:
        "absolute -z-10 -top-20 right-10 md:right-36 lg:right-48 lg:-top-24 w-[70px] h-[70px] lg:w-[100px] lg:h-[100px]",
      src: ASSETS.decoratives.bulb,
      width: 100,
      height: 100,
      initial: { opacity: 0 },
      delay: 0.4,
    },
    {
      className:
        "absolute -z-10 -bottom-40 md:-bottom-20 left-8 md:left-32 lg:-bottom-24 xl:left-72 w-[70px] h-[70px] lg:w-[100px] lg:h-[100px]",
      src: ASSETS.decoratives.paintKit,
      width: 100,
      height: 100,
      initial: { opacity: 0 },
      delay: 0.6,
    },
    {
      className:
        "absolute -z-10 -bottom-36 md:-bottom-20 right-8 md:right-28 xl:right-72 w-[70px] h-[70px] lg:w-[100px] lg:h-[100px]",
      src: ASSETS.decoratives.heart,
      width: 100,
      height: 100,
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
      className="dk-safe-x-padding dk-section-distance"
      aria-label="Quote Section"
    >
      <div className="relative">
        <MotionWrapper
          as="p"
          initial={{ y: 100, opacity: 0 }}
          animate={inView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="font-medium text-base md:text-xl leading-[38px] lg:text-2xl text-accent max-w-[933px] mx-auto text-center"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: constant quote text
          dangerouslySetInnerHTML={{
            __html: CONFIG.quotes.text,
          }}
        />

        {animatedFloatingImages.map((item, index) => (
          <FloatingImage
            key={index.toString()}
            item={item}
            inView={inView}
            scrollYProgress={scrollYProgress}
          />
        ))}
      </div>
      <MotionWrapper
        as="p"
        initial={{ y: 100, opacity: 0 }}
        animate={inView ? { y: 0, opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="font-medium text-6xl lg:text-7xl text-accent text-center mt-5"
        style={FONT_SUARTE.style}
      >
        {CONFIG.quotes.author}
      </MotionWrapper>
    </section>
  );
};

export default QuoteSection;
