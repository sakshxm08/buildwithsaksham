"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { BsArrowRight, BsGithub } from "react-icons/bs";
import { IoMdOpen } from "react-icons/io";
import { useInView } from "react-intersection-observer";
import MotionWrapper from "@/components/motion-wrapper";
import SectionHeader from "@/components/section-header";
import { CONFIG } from "@/config";

const CATEGORIES = [
  "All",
  "AI & EdTech",
  "Full Stack & E-Commerce",
  "Dev Tools & Systems",
];

const MyLatestProjectSection = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const filteredProjects = useMemo(() => {
    if (selectedCategory === "All") {
      return CONFIG.projects;
    }
    if (selectedCategory === "Dev Tools & Systems") {
      return CONFIG.projects.filter(
        (p) =>
          p.category.includes("Dev Tools") ||
          p.category.includes("System") ||
          p.category.includes("CLI"),
      );
    }
    return CONFIG.projects.filter((p) => p.category.includes(selectedCategory));
  }, [selectedCategory]);

  return (
    <section
      id="projects"
      ref={ref}
      className="dk-safe-x-padding dk-section-distance scroll-mt-24"
      aria-label="Projects Section"
    >
      <SectionHeader
        title="Featured Projects"
        description="A selection of production web platforms, AI tools, and developer systems I've architected and built."
        inViewport={inView}
        className="text-center"
        animate
      />

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 mt-10">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setSelectedCategory(category)}
            className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer ${
              selectedCategory === category
                ? "dk-gradient-bg text-white shadow-md scale-105"
                : "bg-white text-neutral-700 border border-gray-200 hover:border-primary hover:text-primary"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {filteredProjects.map((project, index) => (
          <MotionWrapper
            key={project.title}
            as="article"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: (index % 6) * 0.08 }}
            whileHover={{ y: -6 }}
            className="group flex flex-col justify-between rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-2xl hover:border-primary/30 transition-all duration-300 overflow-hidden"
          >
            <div>
              {/* Thumbnail Header */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-900 border-b border-gray-100">
                <Image
                  src={project.image}
                  alt={`${project.title} screenshot`}
                  width={600}
                  height={375}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-neutral-900 shadow-md backdrop-blur-sm">
                  {project.category}
                </span>
              </div>

              {/* Body */}
              <div className="p-6">
                <h3 className="font-montserrat font-bold text-xl text-neutral-900 group-hover:text-primary transition-colors">
                  {project.title}
                </h3>

                <p className="mt-2.5 text-sm text-accent2 leading-relaxed line-clamp-3">
                  {project.summary}
                </p>

                {/* Tech Stack Chips */}
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  {project.techStack.map((tech) => (
                    <span
                      key={tech.name}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray text-neutral-800"
                      title={tech.name}
                    >
                      <span className={`${tech.color} text-sm`}>
                        {tech.icon}
                      </span>
                      <span>{tech.name}</span>
                    </span>
                  ))}
                </div>

                {/* Highlights */}
                {project.highlights && (
                  <ul className="mt-4 space-y-1">
                    {project.highlights.slice(0, 2).map((highlight) => (
                      <li
                        key={highlight}
                        className="flex items-center gap-2 text-xs text-accent2"
                      >
                        <span className="size-1.5 rounded-full bg-primary" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 pt-0 border-t border-gray-100/60 mt-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {project.urls.demo && (
                  <a
                    href={project.urls.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white dk-gradient-btn shadow-sm hover:shadow-md transition-all"
                    aria-label={`Live demo for ${project.title}`}
                  >
                    <IoMdOpen className="text-base" />
                    <span>Live Demo</span>
                  </a>
                )}
                {project.urls.github && (
                  <a
                    href={project.urls.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-neutral-800 bg-gray hover:bg-neutral-800 hover:text-white transition-all"
                    aria-label={`GitHub repository for ${project.title}`}
                  >
                    <BsGithub className="text-sm" />
                    <span>GitHub</span>
                  </a>
                )}
              </div>
            </div>
          </MotionWrapper>
        ))}
      </div>

      {/* View All Projects CTA */}
      <div className="flex justify-center mt-12">
        <Link
          href="/project"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-neutral-900 text-white font-bold text-sm md:text-base hover:bg-neutral-800 shadow-lg hover:shadow-xl hover:gap-3 transition-all"
        >
          <span>Explore All {CONFIG.projects.length} Projects</span>
          <BsArrowRight className="text-lg" />
        </Link>
      </div>
    </section>
  );
};

export default MyLatestProjectSection;
