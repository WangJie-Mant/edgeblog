"use client";

import { useRouter } from "next/navigation";

type Props = {
  className?: string;
  buttonClassName?: string;
  label?: string;
};

export default function BackToPreviousPage({
  className,
  buttonClassName,
  label = "Back",
}: Props) {
  const router = useRouter();

  const containerClasses =
    className ||
    "w-[90vw] sm:w-[85vw] lg:w-[70vw] max-w-5xl mx-auto my-3 flex justify-start";
  const btnClasses =
    buttonClassName ||
    "inline-flex items-center gap-2 rounded-md border border-base-300 bg-base-100/80 px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-base-200/80 hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

  return (
    <div className={containerClasses}>
      <button
        onClick={() => router.push("/blog")}
        className={btnClasses}
        aria-label={label}
      >
        <img src="/icons/back.svg" alt="" className="w-4 h-4" />
        {label}
      </button>
    </div>
  );
}
