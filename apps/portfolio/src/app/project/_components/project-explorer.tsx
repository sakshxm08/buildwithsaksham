"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { BsGithub, BsSearch } from "react-icons/bs";
import { IoMdOpen } from "react-icons/io";
import MotionWrapper from "@/components/motion-wrapper";
import { CONFIG } from "@/config";

const ALL_CATEGORIES = [
  "All",
  "AI & EdTech",
  "Full Stack & E-Commerce",
  "Dev Tools & Systems",
  "Full Stack & HealthTech",
];

export default function ProjectExplorer() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = useMemo(() => {
    return CONFIG.projects.filter((project) => {
      // Category match
      const matchesCategory =
        selectedCategory === "All" ||
        (selectedCategory === "Dev Tools & Systems"
          ? project.category.includes("Dev Tools") ||
            project.category.includes("System") ||
            project.category.includes("CLI")
          : project.category.includes(selectedCategory));

      // Search match (title, summary, tech stack)
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesCategory;

      const matchesSearch =
        project.title.toLowerCase().includes(query) ||
        project.summary.toLowerCase().includes(query) ||
        project.category.toLowerCase().includes(query) ||
        project.techStack.some((tech) =>
          tech.name.toLowerCase().includes(query),
        );

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="w-full">
      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-5xl mx-auto my-8">
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <BsSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search by name, tech or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-white border border-gray-200 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
                selectedCategory === cat
                  ? "dk-gradient-bg text-white shadow-md scale-105"
                  : "bg-white text-neutral-700 border border-gray-200 hover:border-primary hover:text-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="max-w-5xl mx-auto mb-6 flex items-center justify-between text-xs font-semibold text-accent2 px-2">
        <span>
          Showing {filteredProjects.length} of {CONFIG.projects.length} projects
        </span>
        {(searchQuery || selectedCategory !== "All") && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
            }}
            className="text-primary hover:underline cursor-pointer"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Grid */}
      {filteredProjects.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-gray-100 max-w-xl mx-auto">
          <p className="text-xl font-bold text-neutral-800">
            No projects match your filter
          </p>
          <p className="mt-2 text-sm text-accent2">
            Try adjusting your search query or selecting &ldquo;All&rdquo;.
          </p>
        </div>
      ) : (
        <MotionWrapper
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto"
        >
          {filteredProjects.map((project, index) => (
            <MotionWrapper
              key={project.title}
              as="article"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
              whileHover={{ y: -6 }}
              className="group flex flex-col justify-between rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-2xl hover:border-primary/30 transition-all duration-300 overflow-hidden"
            >
              <div>
                {/* Thumbnail */}
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

                {/* Content */}
                <div className="p-6">
                  <h3 className="font-montserrat font-bold text-xl text-neutral-900 group-hover:text-primary transition-colors">
                    {project.title}
                  </h3>

                  <p className="mt-2 text-sm text-accent2 leading-relaxed">
                    {project.summary}
                  </p>

                  {/* Tech stack */}
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
                  {project.highlights && project.highlights.length > 0 && (
                    <ul className="mt-4 space-y-1">
                      {project.highlights.map((highlight) => (
                        <li
                          key={highlight}
                          className="flex items-center gap-2 text-xs text-accent2"
                        >
                          <span className="size-1.5 rounded-full bg-primary shrink-0" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Action buttons */}
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
        </MotionWrapper>
      )}
    </div>
  );
}
