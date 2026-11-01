"use client";

import { useState } from "react";
import { BsBriefcase, BsMortarboard } from "react-icons/bs";
import { HiExternalLink } from "react-icons/hi";
import { useInView } from "react-intersection-observer";
import MotionWrapper from "@/components/motion-wrapper";
import SectionHeader from "@/components/section-header";
import { CONFIG } from "@/config";

const ExperienceSection = () => {
  const [activeTab, setActiveTab] = useState<"experience" | "education">(
    "experience",
  );
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <section
      id="experience"
      ref={ref}
      className="dk-safe-x-padding dk-section-distance scroll-mt-24"
      aria-label="Experience & Education Section"
    >
      <SectionHeader
        title="Experience & Education"
        description="A timeline of my professional work experience, impactful engineering roles, and academic background."
        inViewport={inView}
        className="text-center"
        animate
      />

      {/* Segmented Controls / Switcher */}
      <div className="flex justify-center mt-10">
        <div className="inline-flex p-1.5 bg-gray rounded-2xl border border-gray-200/50">
          <button
            type="button"
            onClick={() => setActiveTab("experience")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm md:text-base font-bold transition-all cursor-pointer ${
              activeTab === "experience"
                ? "bg-white text-neutral-900 shadow-md"
                : "text-accent2 hover:text-neutral-900"
            }`}
          >
            <BsBriefcase className="text-lg text-primary" />
            <span>Work Experience</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("education")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm md:text-base font-bold transition-all cursor-pointer ${
              activeTab === "education"
                ? "bg-white text-neutral-900 shadow-md"
                : "text-accent2 hover:text-neutral-900"
            }`}
          >
            <BsMortarboard className="text-lg text-secondary" />
            <span>Education</span>
          </button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="max-w-4xl mx-auto mt-12">
        {activeTab === "experience" ? (
          <div className="space-y-6">
            {CONFIG.experience?.map((exp, index) => (
              <MotionWrapper
                key={`${exp.company}-${exp.role}`}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="group relative p-6 md:p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-montserrat font-bold text-xl text-neutral-900">
                        {exp.role}
                      </h3>
                      {exp.companyUrl ? (
                        <a
                          href={exp.companyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                        >
                          @{exp.company}
                          <HiExternalLink className="text-xs" />
                        </a>
                      ) : (
                        <span className="text-sm font-semibold text-primary">
                          @{exp.company}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-medium text-accent2">
                      {exp.location}
                    </span>
                  </div>

                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary w-fit">
                    {exp.period}
                  </span>
                </div>

                <p className="mt-4 text-sm md:text-base text-accent2 leading-relaxed">
                  {exp.description}
                </p>

                {exp.skills && exp.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-5">
                    {exp.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray text-neutral-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </MotionWrapper>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {CONFIG.education?.map((edu, index) => (
              <MotionWrapper
                key={edu.institution}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="group relative p-6 md:p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:border-secondary/30 transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div>
                    <h3 className="font-montserrat font-bold text-xl text-neutral-900">
                      {edu.institution}
                    </h3>
                    <p className="text-sm md:text-base font-medium text-primary mt-1">
                      {edu.degree}
                    </p>
                    <span className="text-xs font-medium text-accent2">
                      {edu.location}
                    </span>
                  </div>

                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-secondary/10 text-secondary w-fit">
                    {edu.period}
                  </span>
                </div>

                {edu.grade && (
                  <div className="mt-4 inline-block px-3 py-1 bg-gray rounded-md text-xs font-semibold text-neutral-700">
                    Degree: {edu.grade}
                  </div>
                )}
              </MotionWrapper>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ExperienceSection;
