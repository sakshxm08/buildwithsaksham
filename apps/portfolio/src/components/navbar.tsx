"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { BsFileEarmarkPerson } from "react-icons/bs";
import { RxCaretRight } from "react-icons/rx";
import { CONFIG } from "@/config";
import { ASSETS } from "@/constant/assets";
import { NAVIGATION_LINKS } from "@/constant/navigation";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const triggerMenuRef = React.useRef<HTMLInputElement>(null);
  const navbarRef = React.useRef<HTMLDivElement>(null);

  const pathname = usePathname();

  const toggleMenu = (): void => {
    setIsMenuOpen((prev) => !prev);
  };

  const closeMenu = (): void => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const closeMenuOnResize = (): void => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("resize", closeMenuOnResize);
    return () => window.removeEventListener("resize", closeMenuOnResize);
  }, []);

  useEffect(() => {
    if (triggerMenuRef.current) {
      if (isMenuOpen) {
        triggerMenuRef.current.checked = true;
      } else {
        triggerMenuRef.current.checked = false;
      }
    }

    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMenuOpen]);

  return (
    <>
      <nav
        ref={navbarRef}
        className={`sticky top-0 z-50 w-screen bg-white dk-safe-layout`}
      >
        {/* <Banner /> */}
        <div className="flex flex-row items-center justify-between py-6 border-b-2 border-b-gray dk-safe-x-padding">
          <Link
            className="z-50 flex items-center gap-3 group"
            href="/"
            onClick={closeMenu}
            prefetch={false}
          >
            <Image
              src={ASSETS.logos.buildwithsaksham}
              alt="Build With Saksham"
              height={38}
              className="object-contain"
            />
            <span className="font-montserrat font-bold text-lg md:text-xl text-neutral-900 tracking-tight group-hover:text-primary transition-colors">
              Build With <span className="dk-gradient-text">Saksham</span>
            </span>
          </Link>
          {/* desktop menu */}
          <div className="flex-row items-center justify-between hidden text-base lg:text-lg font-bold md:flex md:gap-4 lg:gap-6">
            <ul className="flex flex-row md:gap-4 lg:gap-6 justify-evenly">
              {NAVIGATION_LINKS.map((link, _index) => (
                <li key={link.name}>
                  <Link
                    className={`${
                      pathname === link.href
                        ? "text-primary"
                        : "text-accent2 hover:text-neutral-900 transition-colors"
                    } py-2 px-3`}
                    href={link.href}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            <a
              className="px-5 py-2 text-white dk-gradient-btn rounded-xl shadow-md hover:shadow-lg transition-all"
              href={CONFIG.resume.downloadUrl}
              download={CONFIG.resume.fileName}
              target="_blank"
              rel="noopener noreferrer"
            >
              Resume
            </a>
          </div>
          {/* mobile hamburger menu */}
          <div className="z-50 md:hidden">
            <label
              className="cursor-pointer hamburger"
              aria-label="Toggle navigation menu"
            >
              <input
                className="hidden"
                type="checkbox"
                ref={triggerMenuRef}
                onClick={toggleMenu}
              />
              <svg viewBox="0 0 32 32" id="hamburger">
                <title>{isMenuOpen ? "Close Menu" : "Open Menu"}</title>
                <path
                  className="line line-top-bottom"
                  d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22"
                ></path>
                <path className="line" d="M7 16 27 16"></path>
              </svg>
            </label>
          </div>
        </div>
      </nav>
      {/* mobile menu */}
      <div
        className={`${
          isMenuOpen ? "top-0" : "-translate-y-full"
        } fixed top-0 w-screen h-screen transition-all duration-500 ease-in-out z-40 bg-white`}
        style={{
          paddingTop: navbarRef.current
            ? `${navbarRef.current.offsetHeight}px`
            : "90px",
        }}
      >
        <div className="flex flex-col items-start justify-between p-4 text-lg font-medium lg:hidden lg:gap-8">
          <ul className="w-full">
            {NAVIGATION_LINKS.map((link, _index) => (
              <li key={link.name} className={`flex mb-2 rounded-lg`}>
                <Link
                  className={`flex-1 py-4 dk-safe-x-padding`}
                  href={link.href}
                  onClick={closeMenu}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`${
                        pathname === link.href
                          ? "dk-gradient-text"
                          : "text-accent"
                      } text-2xl font-semibold`}
                    >
                      {link.name}
                    </span>
                    <span
                      className={`${
                        pathname === link.href ? "text-secondary" : ""
                      } text-4xl`}
                    >
                      <RxCaretRight />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
            <li className="flex text-white rounded-lg dk-gradient-bg">
              <a
                href={CONFIG.resume.downloadUrl}
                className="flex-1 py-4 dk-safe-x-padding"
                download={CONFIG.resume.fileName}
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMenu}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-semibold">Resume</span>
                  <span className="text-4xl">
                    <BsFileEarmarkPerson />
                  </span>
                </div>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Navbar;
