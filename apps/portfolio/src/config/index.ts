import { TECH_STACK } from "../constant/tech-stack";

/**
 * Configuration
 *
 * Saksham Gambhir's Portfolio Configuration
 */

export const CONFIG = {
  name: {
    first: "Saksham",
    last: "Gambhir",
  },
  email: "hi@buildwithsaksham.in",
  role: "Software Engineer",
  headline: "Software Engineer @ Optum | DTU ‘25",
  location: "Gurugram / New Delhi, India",
  socials: {
    github: "https://github.com/sakshxm08",
    linkedin: "https://www.linkedin.com/in/sakshxm08",
    instagram: "https://www.instagram.com/sakshxm08",
  },
  quotes: {
    text: "Building scalable digital experiences that combine high performance, usability, and clean architecture.",
    author: "Saksham Gambhir",
  },
  techStacks: [
    TECH_STACK.nextjs,
    TECH_STACK.reactjs,
    TECH_STACK.typescript,
    TECH_STACK.javascript,
    TECH_STACK.nodejs,
    TECH_STACK.expressjs,
    TECH_STACK.mongodb,
    TECH_STACK.postgresql,
    TECH_STACK.python,
    TECH_STACK.rubyonrails,
    TECH_STACK.docker,
    TECH_STACK.aws,
    TECH_STACK.tailwindcss,
    TECH_STACK.redux,
    TECH_STACK.golang,
    TECH_STACK.vuejs,
    TECH_STACK.vite,
    TECH_STACK.git,
  ],
  resume: {
    fileName: "Saksham's Resume.pdf",
    downloadUrl:
      "https://drive.google.com/file/d/1PAwOCj-z3_uYDbyPKANzd2JhCREc3dKA/view",
  },
  experience: [
    {
      role: "Software Engineer",
      company: "Optum",
      companyUrl: "https://www.optum.com",
      period: "Aug 2026 — Present",
      location: "Gurugram, India · On-site",
      description:
        "Full-Stack Developer building consumer-facing healthcare products serving over 55M+ users. Engineering resilient frontend architectures, performant REST APIs, automated performance testing pipelines, and exploring Generative AI & agentic development workflows.",
      skills: ["React.js", "Full-Stack Development", "APIs", "Generative AI", "Performance Testing", "Healthcare Tech"],
    },
    {
      role: "Technology Development Program (TDP) Associate",
      company: "Optum",
      companyUrl: "https://www.optum.com",
      period: "Jul 2025 — Aug 2026",
      location: "Gurugram, India · On-site",
      description:
        "Graduated from the Technology Development Program with a Recognition Award. Engineered frontend modules, integrated RESTful APIs, designed automated test suites, and explored AI-assisted development across cross-functional teams.",
      skills: ["React.js", "Python", "Automation Testing", "APIs", "CI/CD", "TDP Award"],
    },
    {
      role: "Software Developer Intern",
      company: "TechiZen Inc.",
      companyUrl: "https://www.techizen.com/",
      period: "Oct 2024 — Jul 2025",
      location: "Remote",
      description:
        "Engaged in redesigning and engineering an ed-tech learning platform with deep AI feature integration for enhanced user engagement. Developed robust frontend interfaces and scalable backend services with Vue.js, Node.js, Express, and MongoDB.",
      skills: ["Vue.js", "Node.js", "Express.js", "MongoDB", "REST APIs", "AI Integration"],
    },
    {
      role: "Full Stack Developer Intern",
      company: "CalmClove",
      companyUrl: "https://calmclove.com",
      period: "Mar 2024 — Apr 2024",
      location: "Remote",
      description:
        "Architected a production-ready mental wellness platform using React, TailwindCSS, Ruby on Rails, and PostgreSQL. Created an offline-capable Progressive Web App (PWA) with Vite, increasing user engagement by 25%. Deployed backend services on AWS EC2 with CloudWatch monitoring, frontend on Cloudflare, and built a Python-based AI Reddit bot with OpenAI API and AWS S3.",
      skills: ["React", "Ruby on Rails", "PostgreSQL", "TailwindCSS", "Vite PWA", "AWS EC2", "AWS S3", "OpenAI API"],
    },
    {
      role: "Frontend Developer Intern",
      company: "ithinkyouare",
      companyUrl: "https://ithinkyoua.re",
      period: "Jan 2024 — Feb 2024",
      location: "Remote",
      description:
        "Built responsive web platform from scratch using React and TailwindCSS based on Figma designs, improving mobile interaction by 50%. Implemented React Context API for global state, deployed on Cloudflare with dynamic Open Graph workers (<200ms latency), and contributed to Django/Python backend features.",
      skills: ["React", "TailwindCSS", "Cloudflare Workers", "Django", "Python", "PostgreSQL"],
    },
  ],
  education: [
    {
      degree: "Bachelor of Technology (B.Tech) — Electronics & Communication Engineering",
      institution: "Delhi Technological University (Formerly DCE)",
      period: "Dec 2021 — Jul 2025",
      location: "Delhi, India",
      grade: "8.84 CGPA (2nd Rank in ECE Department)",
    },
  ],
  projects: [
    {
      title: "VidyaAI",
      summary:
        "A Socratic AI teaching assistant designed to guide students through Data Structures & Algorithms using inquiry-based dialogue, powered by NVIDIA NeMo Guardrails and LLMs.",
      image: "/projects/vidya-ai.svg",
      techStack: [
        TECH_STACK.reactjs,
        TECH_STACK.python,
        TECH_STACK.vite,
        TECH_STACK.tailwindcss,
      ],
      urls: {
        demo: "https://vidyaai.netlify.app/",
        github: "https://github.com/sakshxm08/VidyaAI",
      },
      category: "AI & EdTech",
      featured: true,
      highlights: [
        "Socratic pedagogy dialog engine",
        "NVIDIA NeMo Guardrails safety",
        "Interactive DSA knowledge base",
      ],
    },
    {
      title: "Ohstree Storefront & Admin",
      summary:
        "A full-stack production e-commerce platform with customer storefront, admin dashboard, cart/wishlist management, OTP sessions, Resend automated emails, and Shiprocket tracking.",
      image: "/projects/ohstree.svg",
      techStack: [
        TECH_STACK.nextjs,
        TECH_STACK.typescript,
        TECH_STACK.tailwindcss,
        TECH_STACK.mongodb,
        TECH_STACK.redux,
      ],
      urls: {
        github: "https://github.com/sakshxm08/ohstree",
      },
      category: "Full Stack & E-Commerce",
      featured: true,
      highlights: [
        "Next.js App Router architecture",
        "Automated transactional emails (Resend)",
        "Shiprocket logistics integration",
        "Secure OTP session authentication",
      ],
    },
    {
      title: "ShortSpot",
      summary:
        "A feature-rich URL shortener and link management dashboard with custom aliases, real-time click analytics, dynamic QR code generation, and link lifecycle management.",
      image: "/projects/shortspot.svg",
      techStack: [
        TECH_STACK.reactjs,
        TECH_STACK.nodejs,
        TECH_STACK.expressjs,
        TECH_STACK.mongodb,
        TECH_STACK.tailwindcss,
      ],
      urls: {
        demo: "https://shortspot.netlify.app/",
        github: "https://github.com/sakshxm08/shortspot",
      },
      category: "Full Stack & Dev Tools",
      featured: true,
      highlights: [
        "Real-time click & visitor analytics",
        "Instant custom QR code generation",
        "Link editing & expiration controls",
      ],
    },
    {
      title: "CalmClove",
      summary:
        "A mental wellness telehealth web application built with Ruby on Rails, React, and PostgreSQL, designed as an offline-first PWA deployed on AWS for seamless user access.",
      image: "/projects/calmclove.svg",
      techStack: [
        TECH_STACK.reactjs,
        TECH_STACK.rubyonrails,
        TECH_STACK.postgresql,
        TECH_STACK.tailwindcss,
        TECH_STACK.aws,
      ],
      urls: {
        demo: "https://calmclove.com/",
        github: "https://github.com/sakshxm08",
      },
      category: "Full Stack & HealthTech",
      featured: true,
      highlights: [
        "Offline-capable PWA via Vite",
        "25% boost in mobile engagement",
        "Scalable AWS cloud architecture",
      ],
    },
    {
      title: "ithinkyoua.re",
      summary:
        "A kindness and positive compliment amplification platform with high-concurrency Cloudflare edge caching, responsive animations, and sub-200ms server response times.",
      image: "/projects/ithinkyouare.svg",
      techStack: [TECH_STACK.reactjs, TECH_STACK.tailwindcss, TECH_STACK.aws],
      urls: {
        demo: "https://ithinkyoua.re/",
        github: "https://github.com/sakshxm08",
      },
      category: "Frontend & Social",
      featured: false,
      highlights: [
        "Sub-200ms edge response latency",
        "50% increase in mobile interaction",
        "Optimized Context API state",
      ],
    },
    {
      title: "WearWorx",
      summary:
        "A contemporary streetwear and fashion e-commerce platform built on the MERN stack with JWT authentication, Redux persistent cart, and product catalog filters.",
      image: "/projects/wearworx.svg",
      techStack: [
        TECH_STACK.reactjs,
        TECH_STACK.nodejs,
        TECH_STACK.expressjs,
        TECH_STACK.mongodb,
        TECH_STACK.redux,
        TECH_STACK.tailwindcss,
      ],
      urls: {
        demo: "https://wearworx.sakshxm08.in/",
        github: "https://github.com/sakshxm08/wearworx_mern",
      },
      category: "Full Stack & E-Commerce",
      featured: false,
      highlights: [
        "MERN architecture with Redux Toolkit",
        "Secure token authentication",
        "Responsive shopping & cart workflows",
      ],
    },
    {
      title: "Cloud Drive",
      summary:
        "A high-throughput self-hosted cloud storage and file management service written in Go, featuring role-based sharing, chunked uploads, and Docker deployment.",
      image: "/projects/cloud-drive.svg",
      techStack: [TECH_STACK.golang, TECH_STACK.docker],
      urls: {
        github:
          "https://github.com/sakshxm08/buildwithsaksham/tree/main/apps/drive",
      },
      category: "System & Cloud",
      featured: false,
      highlights: [
        "High-performance Go backend",
        "Multi-user file management & sharing",
        "Disk caching & Dockerized container",
      ],
    },
    {
      title: "buildwithsaksham CLI",
      summary:
        "An interactive terminal business card distributed on npm (`npx buildwithsaksham`), allowing developers to explore my contact, projects, and links directly in shell.",
      image: "/projects/cli-card.svg",
      techStack: [TECH_STACK.nodejs, TECH_STACK.javascript],
      urls: {
        demo: "https://www.npmjs.com/package/buildwithsaksham",
        github:
          "https://github.com/sakshxm08/buildwithsaksham/tree/main/apps/npx",
      },
      category: "Dev Tools & CLI",
      featured: false,
      highlights: [
        "Zero-install execution via npx",
        "Interactive chalk & boxen styling",
        "Published package on npm registry",
      ],
    },
    {
      title: "AI Caption Generator",
      summary:
        "An intelligent copywriting tool powered by OpenAI and Python that generates platform-tailored social media captions, tone variations, and optimized hashtags.",
      image: "/projects/caption-gen.svg",
      techStack: [
        TECH_STACK.python,
        TECH_STACK.nodejs,
        TECH_STACK.reactjs,
        TECH_STACK.tailwindcss,
      ],
      urls: {
        github: "https://github.com/sakshxm08/caption-generator",
      },
      category: "AI & Dev Tools",
      featured: false,
      highlights: [
        "Multi-platform tone customization",
        "Automated hashtag generation",
        "Instant clipboard copy integration",
      ],
    },
  ],
} satisfies Config;
