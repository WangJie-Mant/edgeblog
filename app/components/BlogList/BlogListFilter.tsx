"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type TagOption = {
  key: string;
  label: string;
  count: number;
};

type BlogListFilterProps = {
  basePath: string;
  options: TagOption[];
  selectedTag?: string | null;
};

export default function BlogListFilter({
  basePath,
  options,
  selectedTag,
}: BlogListFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTag = selectedTag ?? "all";

  const handleSelect = useCallback(
    (nextTag: string) => {
      const params = new URLSearchParams(searchParams?.toString());
      if (nextTag === "all") {
        params.delete("tag");
      } else {
        params.set("tag", nextTag);
      }
      params.delete("page");
      const query = params.toString();
      router.push(query ? `${basePath}?${query}` : basePath);
    },
    [basePath, router, searchParams],
  );

  return (
    <div className="space-y-3 text-sm">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          className="checkbox checkbox-sm"
          checked={activeTag === "all"}
          onChange={() => handleSelect("all")}
          aria-label="Filter all posts"
        />
        <span>ALL</span>
      </label>
      {options.map((option) => (
        <label
          key={option.key}
          className="flex items-center gap-2 cursor-pointer"
        >
          <input
            type="checkbox"
            className="checkbox checkbox-sm"
            checked={activeTag === option.key}
            onChange={() => handleSelect(option.key)}
            aria-label={`Filter ${option.label}`}
          />
          <span>
            {option.label} ({option.count})
          </span>
        </label>
      ))}
    </div>
  );
}
