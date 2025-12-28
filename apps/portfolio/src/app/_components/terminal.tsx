"use client";

import { GoCopy } from "react-icons/go";
import { MdDone } from "react-icons/md";
import { useState } from "react";

const Terminal = () => {
  const [hasCopied, setHasCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText("npx buildwithsaksham");
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  return (
    <pre className="bg-linear-to-r from-primary/30 to-secondary/30 text-xs sm:text-sm md:text-base py-2 px-4 rounded-md max-w-sm sm:max-w-md md:max-w-lg leading-10 font-mono my-10">
      <div className="text-gray-500">
        {"// Hit this in your terminal to connect with me. "}
      </div>
      <div className="flex items-center justify-between pl-4 border-l border-gray-700">
        <span>
          <span className="text-main-500">npx</span> buildwithsaksham
        </span>
        <div
          className={`${
            hasCopied ? "dk-gradient-bg" : "hover:bg-primary/20"
          } aspect-square w-8 flex items-center justify-center border border-gray-400 rounded hover:border-primary cursor-pointer transition-all duration-500`}
          onClick={onCopy}
        >
          {hasCopied ? <MdDone className="text-white" /> : <GoCopy />}
        </div>
      </div>
    </pre>
  );
};

export default Terminal;
