"use client";

import { useCallback, useMemo, useState } from "react";

type CarouselEntry = {
  src: string;
  id: number;
};

type Props = {
  items: CarouselEntry[];
};

export default function CarouselClient({ items }: Props) {
  const [index, setIndex] = useState(0);
  const total = items.length;

  const { src, id } = useMemo(() => items[index], [items, index]);

  const goPrev = useCallback(
    () => setIndex((prev) => (prev - 1 + total) % total),
    [total],
  );

  const goNext = useCallback(
    () => setIndex((prev) => (prev + 1) % total),
    [total],
  );

  return (
    <div className="relative w-[90vw] sm:w-[85vw] lg:w-[70vw] max-w-5xl mx-auto rounded-box overflow-hidden bg-black">
      <div className="h-[420px] w-full flex items-center justify-center">
        <img
          src={src}
          alt={`slide ${id}`}
          className="h-full w-full object-contain"
        />
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-4 right-4 flex items-center justify-between">
        <button
          onClick={goPrev}
          className="btn btn-circle pointer-events-auto"
          aria-label="previous slide"
        >
          ❮
        </button>
        <button
          onClick={goNext}
          className="btn btn-circle pointer-events-auto"
          aria-label="next slide"
        >
          ❯
        </button>
      </div>
    </div>
  );
}
