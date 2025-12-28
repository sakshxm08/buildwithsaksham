import { TECH_STACK } from "../constant/tech-stack";

/**
 * Configuration
 *
 * Modify the information below to customize your portfolio
 */

export const CONFIG = {
  name: {
    first: "Saksham",
    last: "Gambhir",
  },
  email: "hi@buildwithsaksham.in",
  role: "Full-stack Web Developer",
  location: "Gurugram, India",
  socials: {
    github: "https://github.com/sakshxm08",
    linkedin: "https://www.linkedin.com/in/sakshxm08",
    instagram: "https://www.instagram.com/sakshxm08",
  },
  quotes: {
    text: "This portfolio was made with heart and soul, pouring passion and creativity into every detail to bring it to life. It&apos;s not just a portfolio, it&apos;s a labor of love.",
    author: "Saksham Gambhir",
  },
  techStacks: [
    ...Object.values(TECH_STACK),
    // you can add tech stack one by one if you don't want to use all registered tech stack
    // TECH_STACK.nextjs,
    // TECH_STACK.reactjs,
    // TECH_STACK.tailwindcss,
  ],
  resume: {
    fileName: "Saksham's Resume.pdf",
    downloadUrl:
      "https://drive.google.com/file/d/1PAwOCj-z3_uYDbyPKANzd2JhCREc3dKA/view",
  },
  projects: [
    {
      title: "Portfolio Website 1",
      summary:
        "A personal portfolio website to showcase my projects and skills, built with Next.js and Tailwind CSS.",
      image: "/projects/3d-portfolio.webp",
      techStack: [
        TECH_STACK.reactjs,
        TECH_STACK.nextjs,
        TECH_STACK.tailwindcss,
        TECH_STACK.typescript,
      ],
      urls: {
        demo: "https://3d-portfolio.derikn.com",
        github: "https://github.com/Deri-Kurniawan/3d-portfolio",
        figma:
          "https://www.figma.com/design/TYBBBbA5cvBN4QU70hNxvr/3D-PORTFOLIO?node-id=307-16&t=1mhoto9IrOWXBn4O-1",
      },
      category: "Web App",
    },
    {
      title: "Portfolio Website 2",
      summary:
        "A personal portfolio website to showcase my projects and skills, built with Next.js and Tailwind CSS.",
      image: "/projects/3d-portfolio.webp",
      techStack: [
        TECH_STACK.reactjs,
        TECH_STACK.nextjs,
        TECH_STACK.tailwindcss,
        TECH_STACK.typescript,
      ],
      urls: {
        demo: "https://3d-portfolio.derikn.com",
        github: "https://github.com/Deri-Kurniawan/3d-portfolio",
      },
      category: "Web App",
    },
    {
      title: "Portfolio Website 3",
      summary:
        "A personal portfolio website to showcase my projects and skills, built with Next.js and Tailwind CSS.",
      image: "/projects/3d-portfolio.webp",
      techStack: [
        TECH_STACK.reactjs,
        TECH_STACK.nextjs,
        TECH_STACK.tailwindcss,
        TECH_STACK.typescript,
      ],
      urls: {
        demo: "https://3d-portfolio.derikn.com",
        figma:
          "https://www.figma.com/design/TYBBBbA5cvBN4QU70hNxvr/3D-PORTFOLIO?node-id=307-16&t=1mhoto9IrOWXBn4O-1",
      },
      category: "Web App",
    },
    {
      title: "Portfolio Website 4",
      summary:
        "A personal portfolio website to showcase my projects and skills, built with Next.js and Tailwind CSS.",
      image: "/projects/3d-portfolio.webp",
      techStack: [
        TECH_STACK.reactjs,
        TECH_STACK.nextjs,
        TECH_STACK.tailwindcss,
        TECH_STACK.typescript,
      ],
      urls: {
        github: "https://github.com/Deri-Kurniawan/3d-portfolio",
        figma:
          "https://www.figma.com/design/TYBBBbA5cvBN4QU70hNxvr/3D-PORTFOLIO?node-id=307-16&t=1mhoto9IrOWXBn4O-1",
      },
      category: "Web App",
    },
    {
      title: "Portfolio Website 5",
      summary:
        "A personal portfolio website to showcase my projects and skills, built with Next.js and Tailwind CSS.",
      image: "/projects/3d-portfolio.webp",
      techStack: [
        TECH_STACK.reactjs,
        TECH_STACK.nextjs,
        TECH_STACK.tailwindcss,
        TECH_STACK.typescript,
      ],
      urls: {
        github: "https://github.com/Deri-Kurniawan/3d-portfolio",
      },
      category: "Web App",
    },
    {
      title: "Portfolio Website 6",
      summary:
        "A personal portfolio website to showcase my projects and skills, built with Next.js and Tailwind CSS.",
      image: "/projects/3d-portfolio.webp",
      techStack: [
        TECH_STACK.reactjs,
        TECH_STACK.nextjs,
        TECH_STACK.tailwindcss,
        TECH_STACK.typescript,
      ],
      urls: {
        figma:
          "https://www.figma.com/design/TYBBBbA5cvBN4QU70hNxvr/3D-PORTFOLIO?node-id=307-16&t=1mhoto9IrOWXBn4O-1",
      },
      category: "Web App",
    },
  ],
} satisfies Config;
