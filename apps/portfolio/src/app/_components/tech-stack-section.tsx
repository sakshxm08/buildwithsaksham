"use client";

import { useInView } from "react-intersection-observer";
import MotionWrapper from "@/components/motion-wrapper";
import SectionHeader from "@/components/section-header";
import { CONFIG } from "@/config";

const TechStackSection = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <section
      ref={ref}
      className="dk-safe-x-padding dk-section-distance"
      aria-label="Technology Stack Section"
    >
      <SectionHeader
        title="Technical Skills &amp; Stack"
        description="A curated toolkit of modern frameworks, programming languages, databases, and cloud technologies I build with."
        inViewport={inView}
        className="text-center"
        animate
      />
      <div className="flex items-center justify-center mt-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6 max-w-5xl w-full">
          {CONFIG.techStacks.map((item, index) => (
            <MotionWrapper
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ y: -4, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="group relative flex flex-col items-center justify-center p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary/40 transition-all duration-300"
            >
              <a
                href={item.siteUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={`Visit ${item.name} documentation`}
                className="flex flex-col items-center justify-center w-full text-center"
              >
                <div
                  className={`${item.color} text-4xl md:text-5xl mb-3 group-hover:scale-110 transition-transform duration-300`}
                >
                  {item.icon}
                </div>
                <span className="font-montserrat font-bold text-sm text-neutral-800 group-hover:text-primary transition-colors">
                  {item.name}
                </span>
              </a>
            </MotionWrapper>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechStackSection;
