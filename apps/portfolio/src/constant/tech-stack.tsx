import {
  SiAmazonwebservices,
  SiDocker,
  SiExpress,
  SiGit,
  SiGo,
  SiJavascript,
  SiMongodb,
  SiNextdotjs,
  SiNodedotjs,
  SiPostgresql,
  SiPython,
  SiReact,
  SiRedux,
  SiRubyonrails,
  SiTailwindcss,
  SiTypescript,
  SiVite,
  SiVuedotjs,
} from "react-icons/si";

/**
 * Register your tech stack used in your projects here.
 * Make sure the key is the same as the one used in the project config.
 */
export const TECH_STACK = {
  nextjs: {
    name: "Next.js",
    icon: <SiNextdotjs />,
    color: "text-neutral-900 dark:text-neutral-100",
    siteUrl: "https://nextjs.org/",
  },
  reactjs: {
    name: "React",
    icon: <SiReact />,
    color: "text-cyan-500",
    siteUrl: "https://react.dev/",
  },
  typescript: {
    name: "TypeScript",
    icon: <SiTypescript />,
    color: "text-blue-600",
    siteUrl: "https://www.typescriptlang.org/",
  },
  javascript: {
    name: "JavaScript",
    icon: <SiJavascript />,
    color: "text-amber-400",
    siteUrl: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
  },
  nodejs: {
    name: "Node.js",
    icon: <SiNodedotjs />,
    color: "text-emerald-600",
    siteUrl: "https://nodejs.org/",
  },
  expressjs: {
    name: "Express.js",
    icon: <SiExpress />,
    color: "text-neutral-800",
    siteUrl: "https://expressjs.com/",
  },
  mongodb: {
    name: "MongoDB",
    icon: <SiMongodb />,
    color: "text-emerald-500",
    siteUrl: "https://www.mongodb.com/",
  },
  postgresql: {
    name: "PostgreSQL",
    icon: <SiPostgresql />,
    color: "text-blue-600",
    siteUrl: "https://www.postgresql.org/",
  },
  python: {
    name: "Python",
    icon: <SiPython />,
    color: "text-blue-500",
    siteUrl: "https://www.python.org/",
  },
  rubyonrails: {
    name: "Ruby on Rails",
    icon: <SiRubyonrails />,
    color: "text-rose-600",
    siteUrl: "https://rubyonrails.org/",
  },
  docker: {
    name: "Docker",
    icon: <SiDocker />,
    color: "text-sky-500",
    siteUrl: "https://www.docker.com/",
  },
  aws: {
    name: "AWS",
    icon: <SiAmazonwebservices />,
    color: "text-amber-500",
    siteUrl: "https://aws.amazon.com/",
  },
  tailwindcss: {
    name: "Tailwind CSS",
    icon: <SiTailwindcss />,
    color: "text-cyan-500",
    siteUrl: "https://tailwindcss.com/",
  },
  redux: {
    name: "Redux",
    icon: <SiRedux />,
    color: "text-purple-600",
    siteUrl: "https://redux.js.org/",
  },
  golang: {
    name: "Go (Golang)",
    icon: <SiGo />,
    color: "text-cyan-600",
    siteUrl: "https://go.dev/",
  },
  vite: {
    name: "Vite",
    icon: <SiVite />,
    color: "text-purple-500",
    siteUrl: "https://vitejs.dev/",
  },
  vuejs: {
    name: "Vue.js",
    icon: <SiVuedotjs />,
    color: "text-emerald-500",
    siteUrl: "https://vuejs.org/",
  },
  git: {
    name: "Git",
    icon: <SiGit />,
    color: "text-orange-600",
    siteUrl: "https://git-scm.com/",
  },
} satisfies Record<string, TechStack>;
