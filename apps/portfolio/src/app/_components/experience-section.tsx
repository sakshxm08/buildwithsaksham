"use client";

import { useMemo, useState } from "react";
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

  const groupedExperiences = useMemo(() => {
    const groups: Array<{
      company: string;
      companyUrl?: string;
      location?: string;
      roles: (typeof CONFIG.experience)[number][];
    }> = [];

    CONFIG.experience?.forEach((exp) => {
      const previousGroup = groups[groups.length - 1];

      if (previousGroup && previousGroup.company === exp.company) {
        previousGroup.roles.push(exp);
        return;
      }

      groups.push({
        company: exp.company,
        companyUrl: exp.companyUrl,
        location: exp.location,
        roles: [exp],
      });
    });

    return groups;
  }, []);

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
          <div className="relative">
            {groupedExperiences.map((group, groupIndex) => (
              <MotionWrapper
                key={`${group.company}-${group.roles[0]?.period}`}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, delay: groupIndex * 0.08 }}
                className="relative pl-14 pb-8 last:pb-0 before:absolute before:left-[18px] before:top-0 before:bottom-0 before:w-px before:bg-primary/20"
              >
                <div className="absolute left-0 top-1.5 flex h-9 w-9 items-center justify-center rounded-full border-2 border-primary/20 bg-white shadow-sm">
                  <span className="h-3 w-3 rounded-full bg-primary" />
                </div>

                <div className="space-y-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        {group.companyUrl ? (
                          <a
                            href={group.companyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-montserrat font-bold text-xl text-neutral-900 hover:text-primary transition-colors"
                          >
                            {group.company}
                            <HiExternalLink className="text-xs" />
                          </a>
                        ) : (
                          <h3 className="font-montserrat font-bold text-xl text-neutral-900">
                            {group.company}
                          </h3>
                        )}
                      </div>

                      {group.location && (
                        <span className="mt-1 block text-xs font-medium text-accent2">
                          {group.location}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6 pl-0">
                    {group.roles.map((exp) => (
                      <div
                        key={`${exp.company}-${exp.role}-${exp.period}`}
                        className="relative pl-6"
                      >
                        <span className="absolute left-0 top-2.5 h-3 w-3 rounded-full border-2 border-white bg-primary shadow-sm" />

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h4 className="font-montserrat font-bold text-lg text-neutral-900">
                              {exp.role}
                            </h4>
                            <span className="mt-1 block text-xs font-medium text-accent2">
                              {exp.location}
                            </span>
                          </div>

                          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary w-fit">
                            {exp.period}
                          </span>
                        </div>

                        <p className="mt-3 text-sm md:text-base text-accent2 leading-relaxed">
                          {exp.description}
                        </p>

                        {exp.skills && exp.skills.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-4">
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
                      </div>
                    ))}
                  </div>
                </div>
              </MotionWrapper>
            ))}
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-[18px] top-0 bottom-0 w-px bg-linear-to-b from-secondary/70 via-secondary/30 to-transparent" />
            {CONFIG.education?.map((edu, index) => (
              <MotionWrapper
                key={`${edu.institution}-${edu.period}`}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="relative pl-14 pb-8 last:pb-0"
              >
                <div className="absolute left-0 top-1.5 flex h-9 w-9 items-center justify-center rounded-full border-2 border-secondary/20 bg-white shadow-sm">
                  <span className="h-3 w-3 rounded-full bg-secondary" />
                </div>

                <div className="space-y-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
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
                    <div className="inline-block px-3 py-1 bg-gray rounded-md text-xs font-semibold text-neutral-700">
                      Degree: {edu.grade}
                    </div>
                  )}
                </div>
              </MotionWrapper>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ExperienceSection;
