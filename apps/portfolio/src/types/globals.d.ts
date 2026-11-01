declare type TechStack = {
  name: string;
  icon: React.ReactNode;
  color: string;
  siteUrl: string;
};

declare type NavigationLink = {
  name: string;
  href: string;
};

declare type Config = {
  name: {
    first: string;
    last: string;
  };
  email: string;
  role: string;
  headline?: string;
  location: string;
  quotes: {
    text: string;
    author: string;
  };
  socials: {
    github: string;
    linkedin: string;
    instagram: string;
  };
  techStacks: TechStack[];
  resume: {
    fileName: string;
    downloadUrl: string;
  };
  projects: {
    title: string;
    summary: string;
    image: StaticImageData | string;
    techStack: {
      name: string;
      icon: React.ReactNode;
      color: string;
      siteUrl: string;
    }[];
    urls: {
      demo?: string;
      github?: string;
      figma?: string;
    };
    category: string;
    featured?: boolean;
    highlights?: string[];
  }[];
  experience?: {
    role: string;
    company: string;
    companyUrl?: string;
    period: string;
    location: string;
    description: string;
    skills: string[];
  }[];
  education?: {
    degree: string;
    institution: string;
    period: string;
    location: string;
    grade?: string;
  }[];
};
