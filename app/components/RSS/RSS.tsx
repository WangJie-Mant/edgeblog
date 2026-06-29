"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Toast from "../Toast/Toast";

export default function RSS() {
  const [copied, setCopied] = useState(false);
  const [success, setSuccess] = useState(false);
  const rssUrl = "https://n4gasaki.icu/rss";

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(rssUrl);
      setCopied(true);
      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
      }, 2000);
    } catch {
      setCopied(false);
      setSuccess(false);
    }
  };
  return (
    <>
      <div
        className="tooltip tooltip-right"
        data-tip={success ? "copied!" : "RSS"}
      >
        <button
          className="btn btn-ghost btn-sm"
          onClick={handleClick}
          aria-label="RSS feed"
        >
          {!success ? (
            <Image src="/icons/rss.svg" alt="RSS" width={20} height={20} />
          ) : (
            <div className="w-6 h-6 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                className="w-6 h-6 animate-pop"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="9" className="opacity-30" />
                <path d="M8 12l3 3 5-5" className="animate-draw" />
              </svg>
            </div>
          )}
          {/* <Image src="/icons/rss.svg" alt="RSS" width={20} height={20} /> */}
        </button>
      </div>
      {/* {copied ? <Toast message="已复制RSS" type="success" /> : null} */}
    </>
  );
}
