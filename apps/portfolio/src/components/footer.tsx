import Link from "next/link";
import { BsGithub, BsInstagram, BsLinkedin } from "react-icons/bs";
import { MdEmail } from "react-icons/md";
import { CONFIG } from "@/config";
import { NAVIGATION_LINKS } from "@/constant/navigation";

const Footer = () => {
  return (
    <footer className="border-t border-gray/50 bg-white/50 backdrop-blur-sm mt-20">
      <div className="py-12 dk-safe-x-padding max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-1">
          <p className="font-montserrat font-bold text-xl text-neutral-900 tracking-tight">
            Build With <span className="dk-gradient-text">Saksham</span>
          </p>
          <p className="text-sm text-accent2">
            Transforming ideas into high-performance web experiences.
          </p>
        </div>

        <div className="flex items-center gap-6 text-sm font-semibold text-accent2">
          {NAVIGATION_LINKS.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="hover:text-primary transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4 text-xl text-accent2">
          <a
            href={CONFIG.socials.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub Profile"
            className="p-2.5 rounded-full hover:bg-gray hover:text-primary transition-all"
          >
            <BsGithub />
          </a>
          <a
            href={CONFIG.socials.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn Profile"
            className="p-2.5 rounded-full hover:bg-gray hover:text-primary transition-all"
          >
            <BsLinkedin />
          </a>
          <a
            href={CONFIG.socials.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram Profile"
            className="p-2.5 rounded-full hover:bg-gray hover:text-primary transition-all"
          >
            <BsInstagram />
          </a>
          <a
            href={`mailto:${CONFIG.email}`}
            aria-label="Send an Email"
            className="p-2.5 rounded-full hover:bg-gray hover:text-primary transition-all"
          >
            <MdEmail className="text-2xl" />
          </a>
        </div>
      </div>

      <div className="border-t border-gray/40 py-4 text-center text-xs text-accent2">
        <p>
          © {new Date().getFullYear()} Saksham Gambhir. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
