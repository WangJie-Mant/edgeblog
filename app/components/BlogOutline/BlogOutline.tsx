"use client";

import { useState } from "react";
import Card from "@/app/components/Card/Card";

type HeadingItem = {
  id: string;
  text: string;
  level: number;
};

type BlogOutlineProps = {
  headings: HeadingItem[];
};

export default function BlogOutline({ headings }: BlogOutlineProps) {
  const [open, setOpen] = useState(false);
  if (headings.length === 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Toggle outline"
        className="fixed left-4 bottom-6 z-40 h-11 w-11 rounded-full border border-base-300 bg-base-100 shadow-md flex items-center justify-center"
      >
        <span className="sr-only">Outline</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          className="h-5 w-5 text-base-content"
          aria-hidden="true"
        >
          <path
            d="M4 7H20M4 12H20M4 17H20"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <div
        className={`fixed left-4 bottom-20 z-40 w-64 max-w-[70vw] transition-all duration-200 ${
          open
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-2 pointer-events-none"
        }`}
      >
        <Card
          title=""
          date=""
          className="!w-full !max-w-none !mx-0"
          content={
            <div className="text-sm max-h-[60vh] overflow-y-auto pr-1">
              <div className="text-xs uppercase tracking-widest text-base-content/50 mb-3">
                大纲
              </div>
              <nav className="space-y-2">
                {headings.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={() => setOpen(false)}
                    className={`block text-base-content/70 hover:text-base-content transition ${
                      item.level >= 4
                        ? "pl-6"
                        : item.level === 3
                          ? "pl-4"
                          : "pl-0"
                    }`}
                  >
                    {item.text}
                  </a>
                ))}
              </nav>
            </div>
          }
        />
      </div>
    </>
  );
}
